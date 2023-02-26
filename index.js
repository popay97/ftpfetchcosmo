const express = require('express');
const FTP = require('ftp');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const port = 3000;

const ftp = new FTP();

const decryptFile = async (encryptedFilePath, privateKeyPath) => {
    const decryptedFilePath = encryptedFilePath.replace(/\.gpg$/, '');
    const openssl = spawn('openssl', [
        'smime', '-decrypt',
        '-in', encryptedFilePath,
        '-inform', 'DER',
        '-binary',
        '-recip', privateKeyPath,
        '-out', decryptedFilePath
    ]);
    await promisify(openssl.on.bind(openssl))('exit');
    return decryptedFilePath;
};

const convertToCsv = async (decryptedFilePath) => {
    const csvFilePath = decryptedFilePath.replace(/\.[^.]+$/, '.csv');
    const openssl = spawn('openssl', [
        'enc', '-d',
        '-aes-256-cbc',
        '-in', decryptedFilePath,
        '-out', csvFilePath
    ]);
    await promisify(openssl.on.bind(openssl))('exit');
    return csvFilePath;
};

const downloadFile = async (ftpPath, localPath) => {
    await new Promise((resolve, reject) => {
        ftp.get(ftpPath, (err, stream) => {
            if (err) {
                reject(err);
                return;
            }
            stream.once('close', () => {
                console.log(`Downloaded file: ${ftpPath} -> ${localPath}`);
                resolve();
            });
            stream.pipe(fs.createWriteStream(localPath));
        });
    });
};

app.get('/getEasyJetFilesFromFtp', async (req, res) => {
    try {
        await promisify(ftp.connect.bind(ftp))({
            host: 'http://ezy-ftp.atcoretec.com',
            port: 22,
            user: 'dmc_cosmo',
            password: '~f0q/ugRR*K]',
            secure: true
        });

        const date = new Date();
        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        const fileName = `COSM_${formattedDate}.gpg`;
        const ftpPath = `/path/to/${fileName}`;
        const localPath = path.join(__dirname, fileName);

        await downloadFile(ftpPath, localPath);

        const decryptedFilePath = await decryptFile(localPath, path.join(__dirname, 'COSM_private.key'));

        const csvFilePath = await convertToCsv(decryptedFilePath);

        const csvContent = fs.readFileSync(csvFilePath, 'utf8');
        console.log(csvContent);

        res.send('File downloaded and converted to CSV');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching file');
    } finally {
        ftp.end();
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
