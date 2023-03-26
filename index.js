const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

//load sftp module
const Client = require('ssh2-sftp-client');
const sftp = new Client();


const decryptFile = async (encryptedFilePath, privateKeyPath, publicKeyPath) => {
    let decryptedFilePath;
    try {
        let encryptedMessage = fs.createReadStream(path.join(__dirname, encryptedFilePath));
        encryptedMessage = await openpgp.message.read(encryptedMessage);
        let privateKey = await fs.promises.readFile(path.join(__dirname, privateKeyPath));
        privateKey = await openpgp.key.readArmored(privateKey);
        var passphrase = `3/qhYaH_9t6)4Xyk/,#Y`;
        await privateKey.keys[0].decrypt(passphrase);
        let publicKey = await fs.promises.readFile(path.join(__dirname, publicKeyPath));
        publicKey = await openpgp.key.read(publicKey);
        let options = {
            message: encryptedMessage,
            publicKeys: publicKey.keys,
            privateKeys: privateKey.keys
        }
        const { data: decryptedMessage } = await openpgp.decrypt(options);
        decryptedFilePath = encryptedFilePath.replace(/\.[^.]+$/, '.txt');
        await fs.promises.writeFile(decryptedFilePath, decryptedMessage);
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
        const list = await sftp.list('/');
        console.log(list, 'the list of files')
        return res.status(200).send(list);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching file');
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
