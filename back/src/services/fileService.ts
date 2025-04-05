import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'

export interface OreContractData {
  terrain_id: string
  gps: { lat: number; lon: number }
  surface_ha: number
  engagement: string
  signataire: string
  date_signature: string
}

export async function generateOreContractPDF(data: OreContractData): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileName = `contrat-ORE-${data.terrain_id}.pdf`
    const filePath = path.join(__dirname, '../../public/contracts', fileName)

    const doc = new PDFDocument()
    const writeStream = fs.createWriteStream(filePath)

    doc.pipe(writeStream)

    doc.fontSize(16).text('CONTRAT MORAL ORE', { align: 'center' })
    doc.moveDown()

    doc.fontSize(12).text(`Terrain : ${data.terrain_id}`)
    doc.text(`Coordonnées GPS : ${data.gps.lat}, ${data.gps.lon}`)
    doc.text(`Surface : ${data.surface_ha} hectares`)
    doc.moveDown()

    doc.text(`Engagement moral :`)
    doc.text(data.engagement, { indent: 20 })
    doc.moveDown()

    doc.text(`Signataire : ${data.signataire}`)
    doc.text(`Date de signature : ${data.date_signature}`)

    doc.end()

    writeStream.on('finish', () => {
      console.log('✅ PDF généré :', filePath)
      resolve(filePath)
    })

    writeStream.on('error', (err) => {
      console.error('❌ Erreur génération PDF :', err)
      reject(err)
    })
  })
}
