import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import { LandMetadata } from '../nft/nftUtils'
import { readFile } from 'fs/promises'

export async function generateOreContractPDF(data: LandMetadata): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const fileName = `contrat-ORE-${data.nft_id}.pdf`
    const filePath = path.join(__dirname, '../../public/contracts', fileName)

    const doc = new PDFDocument()
    const writeStream = fs.createWriteStream(filePath)

    doc.pipe(writeStream)

        // Titre principal
    doc.fontSize(20).font('Helvetica-Bold').text("CONTRAT D'OBLIGATION RÉELLE ENVIRONNEMENTALE", { align: 'center' })
    doc.moveDown()
    doc.fontSize(14).font('Helvetica-Oblique').text("En application de l'article L. 132-3 du Code de l'environnement\nProjet GREENLOCK - Tokenisation écologique", { align: 'center' })
    doc.moveDown(2)

    // Partie entre les soussignés
    doc.fontSize(12).font('Helvetica-Bold').text("ENTRE LES SOUSSIGNÉS :", { underline: true })
    doc.moveDown()

    doc.font('Helvetica').text(`Propriétaire du bien :\nBob Carolli\n${data.owner}\nCi-après dénommé « le Propriétaire »`)
    doc.moveDown()

    doc.text("ET\nCo-contractant :\nConservatoire d'espaces naturels d'Occitanie\n26 Allée de Mycènes\n34000 Montpellier\nSIRET : 382 451 694 00075\nReprésenté par Marie Deschamps en sa qualité de Directrice\nCi-après dénommé « le CEN »")
    doc.moveDown()

    doc.text("ET\nOpérateur de tokenisation :\nGREENLOCK SAS\n8 Rue de l'Innovation\n75008 Paris\nSIRET : 891 526 784 00014\nReprésenté par Damien Mathis, Arnaud Hippolyte, Eva Herson en leurs qualités de Présidents\nCi-après dénommés « GREENLOCK »")
    doc.moveDown(2)

    // Preambule + Articles (raccourcis ici pour l'exemple)
    doc.font('Helvetica-Bold').text("PRÉAMBULE")
    doc.moveDown(0.5)
    doc.font('Helvetica').fontSize(11)

    const preambuleList = [
    "Vu l'article L. 132-3 du Code de l'environnement, issu de la loi n°2016-1087 du 8 août 2016 pour la reconquête de la biodiversité, de la nature et des paysages ;",
    "Considérant l'intérêt général attaché à la protection de l'environnement et de la biodiversité ;",
    "Considérant la volonté du Propriétaire de participer à la préservation de l'environnement et de la biodiversité présente sur son bien ;",
    "Considérant l'objet statutaire du CEN qui vise à la protection et à la gestion durable d'espaces naturels à forte valeur patrimoniale ;",
    "Considérant l'activité de GREENLOCK qui consiste à développer des mécanismes de financement innovants pour la protection de la biodiversité via la technologie blockchain ;",
    "Considérant les caractéristiques environnementales et écologiques du bien objet du présent contrat, telles que décrites dans l'état initial joint au présent contrat (Annexe 1) ;",
    "Considérant le potentiel de séquestration carbone du bien tel qu'évalué dans l'étude de potentiel carbone (Annexe 7) ;"
    ]

    preambuleList.forEach(item => {
    doc.text(`• ${item}`, {
        indent: 10,
        lineGap: 4
    })
    })
    doc.moveDown()

    doc.font('Helvetica-Bold').fontSize(13).text("IL A ÉTÉ CONVENU CE QUI SUIT :", { align: 'left' })
    doc.moveDown()

    doc.font('Helvetica-Bold').fontSize(12).text("Article 1 : Objet du contrat")
    doc.moveDown(0.5)

    doc.font('Helvetica').fontSize(11).text("Le présent contrat a pour objet :")
    doc.moveDown(0.5)

    doc.font('Helvetica').fontSize(11).text("1.1. De mettre en place des obligations réelles environnementales au sens de l'article L. 132-3 du Code de l'environnement, ayant pour finalité le maintien, la conservation, la gestion ou la restauration d'éléments de la biodiversité ou de fonctions écologiques sur le bien immobilier désigné à l'article 2.", {
    indent: 10,
    lineGap: 4
    })
    doc.moveDown(0.5)

    doc.text("1.2. D'associer à cette obligation réelle environnementale un mécanisme de tokenisation sous forme de NFT (Non-Fungible Token) représentant les engagements de protection de la biodiversité et les bénéfices environnementaux, notamment en termes de séquestration carbone, issus de la protection du bien.", {
    indent: 10,
    lineGap: 4
    })
    doc.moveDown(0.5)

    doc.text("1.3. De définir les modalités de création, distribution et gestion des crédits carbone associés à la protection du bien, dénommés \"XCarbonDrop\" sur la blockchain XRP Ledger.", {
    indent: 10,
    lineGap: 4
    })
    doc.moveDown(1.5)


    doc.font('Helvetica-Bold').fontSize(12).text("Article 2 : Désignation du bien")
    doc.moveDown(0.5)

    doc.font('Helvetica').fontSize(11).text("Le Propriétaire est propriétaire du bien immobilier suivant :")
    doc.moveDown(0.5)

    const bienList = [
    `Adresse : ${data.gps}`,
    `Références cadastrales : ${data.ref_cad}`,
    `Superficie totale : ${data.surface}`,
    "Nature du bien : Forêt mixte avec zone humide et prairie"
    ]

    bienList.forEach(item => {
    doc.text(`• ${item}`, {
        indent: 10,
        lineGap: 4
    })
    })
    doc.moveDown(1)

    doc.text("Un plan de situation et un extrait cadastral figurent en Annexe 2 du présent contrat.")
    doc.moveDown(1)

    doc.text("Le Propriétaire déclare que le bien n'est grevé d'aucune servitude ou droit réel de nature à faire obstacle à la mise en œuvre des obligations contenues dans le présent contrat.")
    doc.moveDown(2)


    // Article 3 : Durée du contrat
    doc.font('Helvetica-Bold').fontSize(13).text("Article 3 : Durée du contrat")

    doc.moveDown(0.5)
    doc.font('Helvetica').fontSize(11).text("Le présent contrat est conclu pour une durée de 50 années à compter de sa signature.")
    doc.moveDown(2)

    // Article 4 : Obligations réelles à la charge du Propriétaire
    doc.font('Helvetica-Bold').fontSize(12).text("Article 4 : Obligations réelles à la charge du Propriétaire")
    doc.moveDown(0.5)

    doc.font('Helvetica').fontSize(11).text(
    "Le Propriétaire s'engage pour lui-même ainsi que pour les propriétaires successifs du bien, en cas de transfert de propriété, à respecter les obligations réelles suivantes :"
    )
    doc.moveDown(1)

    // 4.1 Obligations de faire
    doc.font('Helvetica-Bold').text("4.1 Obligations de faire")
    doc.moveDown(0.5)

    const obligationsFaire = [
    "Maintenir les haies et bosquets existants tels qu'identifiés dans l'état initial (Annexe 1)",
    "Entretenir la zone humide présente sur la parcelle 47 selon le plan de gestion joint en Annexe 3",
    "Planter et entretenir 250 arbres d'essences locales (liste en Annexe 4) sur la parcelle 45",
    "SI fauche, réaliser une fauche tardive (après le 15 juillet) sur les prairies identifiées dans l'état initial",
    "Organiser un suivi écologique décennal par un expert qualifié"
    ]

    obligationsFaire.forEach(item => {
    doc.font('Helvetica').text(`• ${item}`, { indent: 10, lineGap: 4 })
    })
    doc.moveDown(1)

    // 4.2 Obligations de ne pas faire
    doc.font('Helvetica-Bold').text("4.2 Obligations de ne pas faire")
    doc.moveDown(0.5)

    const obligationsNePasFaire = [
    "Ne pas utiliser de produits phytosanitaires (herbicides, fongicides, insecticides) sur l'ensemble du bien",
    "Ne pas drainer les zones humides identifiées dans l'état initial",
    "Ne pas réaliser de constructions sur les zones humides (parcelle 47) et sur la prairie (partie nord de la parcelle 46)",
    "Ne pas introduire d'espèces exotiques envahissantes listées en Annexe 5",
    "Ne pas modifier le relief du sol"
    ]

    obligationsNePasFaire.forEach(item => {
    doc.font('Helvetica').text(`• ${item}`, { indent: 10, lineGap: 4 })
    })
    doc.moveDown(2)

    // Article 5 : Obligations du CEN
    doc.font('Helvetica-Bold').fontSize(12).text("Article 5 : Engagements des Co-contractants")
    doc.moveDown(1)

    // 5.1 Engagements du CEN
    doc.font('Helvetica-Bold').fontSize(11).text("5.1 Engagements du CEN")
    doc.moveDown(0.5)

    doc.font('Helvetica').fontSize(11).text("En contrepartie des obligations prises par le Propriétaire, le CEN s'engage à :")
    doc.moveDown(0.5)

    const engagementsCEN = [
    "Apporter un conseil technique pour la mise en œuvre des obligations de l'article 4",
    "Réaliser le suivi écologique annuel du site et la caractérisation initiale",
    "Fournir un accompagnement scientifique pour la gestion du site",
    "Apporter son expertise pour les éventuelles actions de restauration écologique",
    "Réaliser un rapport décennal de suivi environnemental",
    "Vérifier le respect des obligations définies à l'article 4"
    ]

    engagementsCEN.forEach(item => {
    doc.text(`• ${item}`, {
        indent: 10,
        lineGap: 4
    })
    })
    doc.moveDown(1)

    // 5.2 Engagements de GREENLOCK
    doc.font('Helvetica-Bold').fontSize(11).text("5.2 Engagements de GREENLOCK")
    doc.moveDown(0.5)

    doc.font('Helvetica').fontSize(11).text("GREENLOCK s'engage à :")
    doc.moveDown(0.5)

    const engagementsGreenlock = [
    "Créer et émettre un NFT unique représentant l'ORE sur la blockchain XRP Ledger",
    "Mettre en place un système de vérification par imagerie satellite pour le suivi du site",
    "Calculer et certifier annuellement les crédits carbone (XCarbonDrop) générés par la protection du site",
    "Créer une interface numérique permettant au Propriétaire de suivre l'évolution de son bien et les crédits carbone générés",
    "Assurer la transparence de toutes les opérations liées au NFT et aux crédits carbone via la technologie blockchain"
    ]

    engagementsGreenlock.forEach(item => {
    doc.text(`• ${item}`, {
        indent: 10,
        lineGap: 4
    })
    })

    doc.moveDown(2)
    doc.end()

    writeStream.on('finish', async () => {
        try {
          const buffer = await readFile(filePath)
          console.log('✅ PDF généré :', filePath)
          resolve(buffer)
        } catch (err) {
          reject(err)
        }
      })

    writeStream.on('error', (err) => {
      console.error('❌ Erreur génération PDF :', err)
      reject(err)
    })
  })
}