import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import OpenAI from 'openai'

const app = express()

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  console.error('Error no capturado:', err)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason)
})

// Configuración de middleware
app.use(cors())
app.use(express.json())

console.log('Configurando OpenAI con clave:', process.env.OPENAI_API_KEY ? 'Clave presente' : 'Clave ausente')

let openai
try {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  console.log('Cliente OpenAI inicializado correctamente')
} catch (err) {
  console.error('Error al inicializar OpenAI:', err)
}

// Ruta de prueba simple
app.get('/api/test', (req, res) => {
  console.log('Recibida petición a /api/test')
  res.json({ message: 'API funcionando correctamente' })
})

app.post('/api/generate-routine', async (req, res) => {
  console.log('Recibida petición a /api/generate-routine')
  const { prompt } = req.body
  if (!prompt) {
    console.log('Error: Prompt no proporcionado')
    return res.status(400).json({ error: 'Prompt is required' })
  }
  
  // Verificar si OpenAI está disponible
  if (!openai) {
    console.log('OpenAI no está disponible, devolviendo rutina de ejemplo')
    const mockRoutine = {
      bloques: [
        {
          nombre: "Calentamiento",
          ejercicios: [
            { nombre: "Trote suave", detalle: "5 minutos" },
            { nombre: "Estiramientos dinámicos", detalle: "10 repeticiones" }
          ]
        },
        {
          nombre: "Entrenamiento Principal",
          ejercicios: [
            { nombre: "Flexiones", detalle: "3 x 12" },
            { nombre: "Sentadillas", detalle: "3 x 15" },
            { nombre: "Plancha", detalle: "3 x 30 segundos" }
          ]
        },
        {
          nombre: "Enfriamiento",
          ejercicios: [
            { nombre: "Estiramientos estáticos", detalle: "10 minutos" },
            { nombre: "Respiración profunda", detalle: "5 minutos" }
          ]
        }
      ]
    }
    
    const textResponse = "¡Perfecto! He creado una rutina básica para ti según tu solicitud."
    
    return res.json({ 
      result: JSON.stringify(mockRoutine),
      textResponse
    })
  }
  
  try {
    console.log('Enviando prompt a OpenAI:', prompt)
    
    // Construir mensajes para OpenAI
    const systemPrompt = `Eres un entrenador personal experto. Crea rutinas de ejercicios personalizadas.

🚨 FORMATO OBLIGATORIO - DEBES RESPONDER EXACTAMENTE ASÍ:

[TEXTO]: Tu respuesta conversacional amigable
[JSON]: {"bloques": [{"nombre": "Nombre del bloque", "ejercicios": [{"nombre": "Ejercicio", "detalle": "Series x Reps"}]}]}

🔴 REGLAS ABSOLUTAS - NO NEGOCIABLES:
1. NUNCA respondas solo con texto
2. SIEMPRE incluye [TEXTO]: y [JSON]: - ES OBLIGATORIO
3. El JSON debe ser válido y parseable
4. INCLUYE AMBAS SECCIONES SIEMPRE
5. Crea rutinas específicas según la solicitud

Ejemplo CORRECTO:
[TEXTO]: ¡Perfecto! He creado una rutina de tren superior con 4 bloques como solicitaste.
[JSON]: {"bloques": [{"nombre": "Calentamiento", "ejercicios": [{"nombre": "Movilidad articular", "detalle": "5 minutos"}]}, {"nombre": "Pecho y Bíceps", "ejercicios": [{"nombre": "Press de banca", "detalle": "4 x 8-10"}, {"nombre": "Curl con barra", "detalle": "4 x 10-12"}]}, {"nombre": "Espalda y Tríceps", "ejercicios": [{"nombre": "Dominadas", "detalle": "4 x 6-8"}, {"nombre": "Press francés", "detalle": "4 x 10"}]}, {"nombre": "Vuelta a la Calma", "ejercicios": [{"nombre": "Estiramientos", "detalle": "10 minutos"}]}]}`
    
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: prompt
      }
    ]
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 1000,
      temperature: 0.7
    })
    console.log('Respuesta recibida de OpenAI')
    
    let responseContent = completion.choices[0].message.content.trim()
    let textResponse = ''
    let jsonResponse = ''
    
    console.log('Respuesta completa de OpenAI:', responseContent)
    
    console.log('=== RESPUESTA COMPLETA DE OPENAI ===')
    console.log(responseContent)
    console.log('=== FIN RESPUESTA ===')
    
    // Separar texto y JSON de la respuesta con parsing mejorado
    if (responseContent.includes('[TEXTO]:') && responseContent.includes('[JSON]:')) {
      const textMatch = responseContent.match(/\[TEXTO\]:\s*([\s\S]*?)\[JSON\]:/)
      const jsonMatch = responseContent.match(/\[JSON\]:\s*([\s\S]*?)$/)
      
      textResponse = textMatch ? textMatch[1].trim() : ''
      jsonResponse = jsonMatch ? jsonMatch[1].trim() : ''
      
      console.log('JSON encontrado con marcadores [TEXTO]/[JSON]:', jsonResponse)
    } else {
      // Fallback más robusto: buscar patrones alternativos
      console.log('Formato no estándar detectado, aplicando fallback')
      
      // Buscar JSON en cualquier parte de la respuesta
      const jsonMatch = responseContent.match(/{[\s\S]*?"bloques"[\s\S]*?}/)
      if (jsonMatch) {
        jsonResponse = jsonMatch[0]
        textResponse = responseContent.replace(jsonMatch[0], '').trim()
        // Limpiar texto de posibles etiquetas y JSON residual
        textResponse = textResponse.replace(/\[TEXTO\]:\s*|\[JSON\]:\s*/g, '').trim()
        // Remover cualquier fragmento de JSON que pueda quedar
        textResponse = textResponse.replace(/{[^}]*$/, '').trim()
        textResponse = textResponse.replace(/^[^{]*}/, '').trim()
        // Remover fragmentos de JSON al inicio y final
        textResponse = textResponse.replace(/^[\s\S]*?}\s*/, '').trim()
        textResponse = textResponse.replace(/\s*{[\s\S]*$/, '').trim()
        // Remover comillas y caracteres de escape residuales
        textResponse = textResponse.replace(/^"|"$|\\n|\\t/g, '').trim()
        // Remover patrones de JSON comunes
        textResponse = textResponse.replace(/"[^"]*":\s*\[|\]\s*,?\s*}?/g, '').trim()
        
        // Si el texto queda vacío o muy corto, usar un mensaje por defecto
        if (!textResponse || textResponse.length < 10 || textResponse.includes('"') || textResponse.includes('{') || textResponse.includes('}')) {
          textResponse = 'He generado la rutina según tus especificaciones.'
        }
        
        console.log('JSON extraído mediante regex:', jsonResponse)
        console.log('Texto limpio:', textResponse)
      } else {
        // Si no hay JSON válido, usar la respuesta como texto y crear JSON por defecto
        textResponse = responseContent.replace(/\[TEXTO\]:\s*|\[JSON\]:\s*/g, '').trim()
        jsonResponse = JSON.stringify({
          bloques: [{
            nombre: "Rutina Personalizada",
            ejercicios: [{
              nombre: "Consulta reformulada necesaria",
              detalle: "Por favor, reformula tu solicitud para obtener una rutina específica"
            }]
          }]
        })
        console.log('Usando JSON de fallback por defecto')
      }
    }
    
    // Si el JSON está incompleto, intentar repararlo
    if (jsonResponse && !jsonResponse.trim().endsWith('}')) {
      console.log('JSON incompleto detectado, intentando reparar...')
      
      try {
        // Extraer bloques válidos del JSON incompleto
        const bloques = []
        
        // Buscar patrones de bloques en el JSON
        const bloquePattern = /"nombre":\s*"([^"]+)",\s*"ejercicios":\s*\[([^\]]*(?:\][^\]]*)*?)\]/g
        let match
        
        while ((match = bloquePattern.exec(jsonResponse)) !== null) {
          const nombreBloque = match[1]
          const ejerciciosStr = match[2]
          
          // Extraer ejercicios del bloque
          const ejercicios = []
          const ejercicioPattern = /"nombre":\s*"([^"]+)",\s*"detalle":\s*"([^"]*)"/g
          let ejercicioMatch
          
          while ((ejercicioMatch = ejercicioPattern.exec(ejerciciosStr)) !== null) {
            ejercicios.push({
              nombre: ejercicioMatch[1],
              detalle: ejercicioMatch[2]
            })
          }
          
          if (ejercicios.length > 0) {
            bloques.push({
              nombre: nombreBloque,
              ejercicios: ejercicios
            })
          }
        }
        
        if (bloques.length > 0) {
          jsonResponse = JSON.stringify({ bloques: bloques })
          console.log('JSON reparado exitosamente:', jsonResponse)
        } else {
          // Fallback: buscar información en el texto completo
          const textContent = responseContent
          const extractedBloques = []
          
          // Buscar patrones en el texto completo
          const textBloquePattern = /"nombre":\s*"([^"]+)"/g
          const textEjercicioPattern = /"nombre":\s*"([^"]+)",\s*"detalle":\s*"([^"]*)"/g
          
          let textMatch
          while ((textMatch = textBloquePattern.exec(textContent)) !== null) {
            const nombreBloque = textMatch[1]
            const ejercicios = []
            
            // Buscar ejercicios después de este bloque
            const bloqueIndex = textMatch.index
            const nextBloqueMatch = textBloquePattern.exec(textContent)
            const endIndex = nextBloqueMatch ? nextBloqueMatch.index : textContent.length
            
            const bloqueSection = textContent.substring(bloqueIndex, endIndex)
            
            let ejercicioMatch
            textEjercicioPattern.lastIndex = 0
            while ((ejercicioMatch = textEjercicioPattern.exec(bloqueSection)) !== null) {
              ejercicios.push({
                nombre: ejercicioMatch[1],
                detalle: ejercicioMatch[2]
              })
            }
            
            if (ejercicios.length > 0) {
              extractedBloques.push({
                nombre: nombreBloque,
                ejercicios: ejercicios
              })
            }
            
            // Reset para continuar buscando
            textBloquePattern.lastIndex = bloqueIndex + 1
          }
          
          if (extractedBloques.length > 0) {
            jsonResponse = JSON.stringify({ bloques: extractedBloques })
            console.log('JSON extraído del texto completo:', jsonResponse)
          }
        }
      } catch (repairError) {
        console.error('Error al reparar JSON:', repairError)
      }
    }
    
    // Limpiar el JSON de markdown y espacios
    if (jsonResponse.startsWith('```json')) {
      jsonResponse = jsonResponse.replace(/^```json\n|```$/g, '')
    } else if (jsonResponse.startsWith('```')) {
      jsonResponse = jsonResponse.replace(/^```\n|```$/g, '')
    }
    
    // Limpiar espacios y saltos de línea innecesarios
    jsonResponse = jsonResponse.trim()
    
    console.log('Texto extraído:', textResponse)
    console.log('JSON extraído:', jsonResponse)
    
    try {
      // Verificar que sea un JSON válido
      const parsedJson = JSON.parse(jsonResponse)
      console.log('JSON parseado exitosamente:', JSON.stringify(parsedJson, null, 2))
      
      // Verificar que tenga la estructura esperada
      if (!parsedJson.bloques || !Array.isArray(parsedJson.bloques)) {
        throw new Error('Estructura JSON inválida: falta propiedad bloques')
      }
      
      // Validar que cada bloque tenga la estructura correcta
      for (const bloque of parsedJson.bloques) {
        if (!bloque.nombre || !bloque.ejercicios || !Array.isArray(bloque.ejercicios)) {
          throw new Error('Estructura de bloque inválida')
        }
      }
      
      console.log('JSON validado correctamente')
    } catch (parseError) {
      console.error('Error al parsear/validar JSON de OpenAI:', parseError)
      console.log('Contenido JSON problemático:', jsonResponse)
      
      // Intentar extraer información útil del texto para crear un JSON válido
      const fallbackRoutine = {
        bloques: [{
          nombre: "Rutina Generada",
          ejercicios: [{
            nombre: "Rutina basada en tu solicitud",
            detalle: "Revisa la respuesta del entrenador para más detalles"
          }]
        }]
      }
      
      // Si el texto contiene información útil, intentar extraerla
      if (textResponse && textResponse.length > 10) {
        fallbackRoutine.bloques[0].ejercicios[0].nombre = "Rutina personalizada"
        fallbackRoutine.bloques[0].ejercicios[0].detalle = "Ver respuesta del entrenador"
      }
      
      jsonResponse = JSON.stringify(fallbackRoutine)
      console.log('Usando JSON de fallback:', jsonResponse)
    }
    
    // Devolver respuesta completa
    console.log('=== RESPUESTA FINAL ENVIADA AL FRONTEND ===')
    console.log('result:', jsonResponse)
    console.log('textResponse:', textResponse || 'He generado la rutina según tus especificaciones.')
    console.log('=== FIN RESPUESTA FINAL ===')
    
    res.json({ 
      result: jsonResponse,
      textResponse: textResponse || 'He generado la rutina según tus especificaciones.'
    })
  } catch (err) {
    console.error('Error en /api/generate-routine:', err)
    res.status(500).json({ error: err.message })
  }
})

const PORT = process.env.PORT || 3001
const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`AI backend listening on port ${PORT}`)
  console.log('Variables de entorno cargadas:', { PORT, NODE_ENV: process.env.NODE_ENV })
})

server.on('error', (err) => {
  console.error('Error al iniciar el servidor:', err)
  if (err.code === 'EADDRINUSE') {
    console.error(`El puerto ${PORT} ya está en uso. Intenta con otro puerto.`)
  }
})