const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;
const openpgp = require('openpgp');

//load sftp module
const Client = require('ssh2-sftp-client');
const sftp = new Client();


const decryptFile = async (encryptedFilePath, privateKeyPath, publicKeyPath) => {
    let decryptedFilePath;
    try {
        let encryptedMessage = fs.createReadStream(encryptedFilePath);
        encryptedMessage = await openpgp.message.read(encryptedMessage);
        let privateKey = await fs.promises.readFile(path.join(__dirname, privateKeyPath));
        privateKey = await openpgp.key.readArmored(privateKey);
        var passphrase = `COSMpass`;
        await privateKey.keys[0].decrypt(passphrase);
        let publicKey = await fs.promises.readFile(path.join(__dirname, publicKeyPath));
        publicKey = await openpgp.key.read(publicKey);
        let options = {
            message: encryptedMessage,
            publicKeys: publicKey.keys,
            privateKeys: privateKey.keys
        }
        let decryptedMessage = await openpgp.decrypt(options);
        //decryptedMessage.data is a NodeReadableStream so we need to convert it to a string before we can use it
        decryptedMessage = await streamWait(decryptedMessage.data);
        decryptedFilePath = path.join(__dirname, 'decryptedFile.txt');
        fs.writeFileSync(decryptedFilePath, decryptedMessage);

        return decryptedFilePath;
    } catch (err) {
        console.log(err)
    }

    return decryptedFilePath;
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
        // decrypt the file
        //first download the file
        await sftp.get(`/dmc_cosmo/Cosmo/outgoing/live/${cryptFile.name}`, path.join(__dirname, cryptFile.name));
        // decrypt the file
        let downloadedFile = path.join(__dirname, cryptFile.name);
        console.log(downloadedFile);
        const msg = await decryptFile(downloadedFile, './private_key.asc', './pub_key.asc');
        //read msg file path
        const file = fs.readFileSync(msg, 'utf8');
        console.log(file);

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching file');
    }
});
async function streamWait(stream) {
    return new Promise((resolve, reject) => {
        stream.on('end', resolve);
        stream.on('error', reject);
    });
}
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
