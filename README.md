# XRPL Token Application

Cette application JavaScript permet d'interagir avec le réseau de test XRP Ledger (XRPL) pour :

1. Créer un wallet appelé "backend"
2. Demander 10 XRP gratuits au réseau de testnet
3. Mint un token appelé FST et en stocker 1000 sur ce wallet
4. Envoyer 10 tokens FST à l'adresse spécifiée

## Prérequis

- Node.js (version 14 ou supérieure)
- npm (gestionnaire de paquets Node.js)

## Installation

1. Clonez ou téléchargez ce dépôt
2. Ouvrez un terminal dans le dossier du projet
3. Installez les dépendances :

```bash
npm install
```

## Utilisation

Pour exécuter l'application :

```bash
npm start
```

L'application va :
- Se connecter au testnet XRPL
- Créer un nouveau wallet
- Obtenir des XRP gratuits depuis le faucet du testnet
- Créer et émettre 1000 tokens FST
- Tenter d'envoyer 10 tokens FST à l'adresse spécifiée

## Remarques importantes

- Les informations du wallet (adresse et seed) seront affichées dans la console. **Sauvegardez ces informations** pour une utilisation future.
- Sur le réseau de production, le destinataire devrait créer une ligne de confiance (trustline) pour recevoir les tokens.
- Cette application est conçue pour le testnet XRPL et ne doit pas être utilisée avec de vrais fonds.
