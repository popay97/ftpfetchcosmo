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
    const encryptedData = await fs.promises.readFile(encryptedFilePath, 'utf8');
    //remove all whitespace from the encrypted data
    const encryptedDataWithoutWhitespace = encryptedData.replace(/\s/g, '');
    const message = await openpgp.readMessage({
        armoredMessage: encryptedDataWithoutWhitespace // parse armored message
    });
    const privateKey = await fs.promises.readFile(privateKeyPath);
    //remove all whitespace from the private key
    const privateKeyWithoutWhitespace = privateKey.replace(/\s/g, '');
    const publicKey = await fs.promises.readFile(publicKeyPath);
    //remove all whitespace from the public key
    const publicKeyWithoutWhitespace = publicKey.replace(/\s/g, '');
    const passphrase = 'COSMpass';
    const publicKeyObj = await openpgp.readKey({ armoredKey: privateKeyWithoutWhitespace });
    const privateKeyObj = await openpgp.decryptKey({
        privateKey: await openpgp.readKey({ armoredKey: publicKeyWithoutWhitespace }),
        passphrase,
    });
    const { data: decrypted, signatures } = await openpgp.decrypt({
        message,
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
