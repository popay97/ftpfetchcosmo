const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;
const openpgp = require('openpgp');

//load sftp module
const Client = require('ssh2-sftp-client');
const sftp = new Client();

const privateKeyPath = './private_key.asc'; // Update with the actual path to your private key file
const publicKeyPath = './pub_key.asc'; // Update with the actual path to your public key file

const decryptFile = async (encryptedFilePath, privateKeyPath, publicKeyPath) => {
    let sourceStream = fs.readFileSync(encryptedFilePath, 'utf8');
    //remove all new lines and spaces
    sourceStream.replace(/(\r\n|\n|\r)/gm, "");
    sourceStream = `${sourceStream}`
    const message = await openpgp.readMessage({
        armoredMessage: sourceStream // parse armored message
    });
    let privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    privateKey.replace(/(\r\n|\n|\r)/gm, "");
    privateKey = `${privateKey}`
    let publicKey = fs.readFileSync(publicKeyPath, 'utf8');
    publicKey.replace(/(\r\n|\n|\r)/gm, "");
    publicKey = `${publicKey}`
    const passphrase = 'COSMpass';
    const publicKeyObj = await openpgp.readKey({ armoredKey: publicKey });
    const privateKeyObj = await openpgp.decryptKey({
        privateKey: await openpgp.readKey({ armoredKey: privateKey }),
        passphrase,
    });
    const { data: decrypted, signatures } = await openpgp.decrypt({
        message: message,
        decryptionKeys: privateKeyObj,
        expectSigned: true,
        verificationKeys: publicKeyObj, // mandatory with expectSigned=true
    });
    return decrypted;
};

app.get('/getEasyJetFilesFromFtp', async (req, res) => {
    try {
        await sftp.connect({
            host: 'ezy-sftp.atcoretec.com',
            port: '22',
            username: 'dmc_cosmo',
            password: '~f0q/ugRR*K]'
        });
        const list = await sftp.list('/dmc_cosmo/Cosmo/outgoing/live');
        // grab the file COSM_2023-03-26.gpg
        const cryptFile = list.find(file => file.name === 'COSM_2023-03-26.gpg');
        // download the file
        const downloadedFilePath = path.join(__dirname, cryptFile.name);
        await sftp.get(`/dmc_cosmo/Cosmo/outgoing/live/${cryptFile.name}`, downloadedFilePath);
        // decrypt the file
        const decryptedData = await decryptFile(downloadedFilePath, privateKeyPath, publicKeyPath);

        // Return the decrypted file content
        return res.status(200).send(decryptedData);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching file');
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
