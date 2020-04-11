'use strict'

const admin = require('firebase-admin')
let serviceAccount = require('../configdb.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();

module.exports = db