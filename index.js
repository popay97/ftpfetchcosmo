const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;
const gpg = require('gpg');
const Papa = require("papaparse")
var bodyParser = require('body-parser')
// load sftp module
const Client = require('ssh2-sftp-client');
const cron = require('node-cron');
const sftp = new Client();
const axios = require('axios');
var privateKey = `-----BEGIN PGP PRIVATE KEY BLOCK-----
Version: Keybase OpenPGP v1.0.0
Comment: https://keybase.io/crypto

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
=LKIK
-----END PGP PRIVATE KEY BLOCK-----`


var jsonParser = bodyParser.json()
app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({});
    }
    next();
});
async function decryptGpgFile(encryptedFilePath, outputFilePath) {
    // Import private key
    return await new Promise((resolve, reject) => {
        gpg.importKey(privateKey, [], (success, err) => {
            // args needed in order to skip the password entry - can only
            // be used with callStreaming
            const args = [
                "--pinentry-mode",
                "loopback",
                "--passphrase",
                "COSMpass",
            ]
            gpg.callStreaming(encryptedFilePath, outputFilePath, args, (err, success) => {
                if (err) {
                    console.log(err)
                    reject(err)
                } else {
                    console.log(success)
                    resolve()
                }
            })
        })
    })


}



app.post('/getEasyJetFilesFromFtp', jsonParser, async (req, res) => {

        // Set the file names to fetch
        let fileNamesToFetch = [];
        
    
        try {
            // Connect to the SFTP server
            await sftp.connect({
                host: 'ezy-sftp.atcoretec.com',
                port: '22',
                username: 'dmc_cosmo',
                password: '~f0q/ugRR*K]', // Replace with your actual password
            });
    
            // Get the list of files in the FTP directory
            const list = await sftp.list('/dmc_cosmo/Cosmo/outgoing/live');
            fileNamesToFetch = list.map((file) => file.name);
            const filePath = path.join(__dirname, 'processed_files.txt');
    
            let processedFiles;
            
            try {
                // Try to read the file
                processedFiles = fs.readFileSync(filePath, 'utf-8').split('\n').filter(Boolean);
            } catch (error) {
                if (error.code === 'ENOENT') {
                    // If the file doesn't exist, create an empty array
                    processedFiles = [];
                    // Write the empty array to the file
                    fs.writeFileSync(filePath, ' \n', 'utf-8');
                } else {
                    // If there's another error, handle it accordingly
                    console.error('Error reading file:', error);
                    // Optionally, you may choose to exit the script or handle the error differently
                }
            }
            
            // Loop through the file names to fetch
            for (let i = 0; i < fileNamesToFetch.length; i++) {
                // Find the file in the FTP directory
                const cryptFile = list.find((file) => file.name === fileNamesToFetch[i].trim());
    
                if (cryptFile) {
                    // Download the file
                    const downloadedFilePath = path.join(__dirname, cryptFile.name);
                    await sftp.get(`/dmc_cosmo/Cosmo/outgoing/live/${cryptFile.name}`, downloadedFilePath);
    
                    // Decrypt the file
                    await decryptGpgFile(downloadedFilePath, path.join(__dirname, 'decryptedFile.csv'));
    
                    // Read the decrypted file
                    const decryptedData = await fs.promises.readFile(path.join(__dirname, 'decryptedFile.csv'), 'utf8');
                   
                    // Parse the decrypted CSV data
                    const parsedFile = [];
                    await new Promise((resolve, reject) => {
                        Papa.parse(decryptedData, {
                            header: false,
                            skipEmptyLines: true,
                            complete: (results) => {
                                parsedFile.push(...results.data);
                                resolve();
                            },
                            error: (err) => {
                                reject(err);
                            }
                        });
                    });
    
                    // Send the parsed data to the main service
                    const sendtoMainService = await axios.post('https://shark-app-zyalp.ondigitalocean.app/api/v1/csv', parsedFile);
                    console.log(sendtoMainService.data);
    
                    // Append the processed file name to the processed_files.txt file
                    fs.appendFileSync(path.join(__dirname, 'processed_files.txt'), `\n${cryptFile.name}`);
    
                    // Delete the downloaded and decrypted files
                    fs.unlinkSync(downloadedFilePath);
                    fs.unlinkSync(path.join(__dirname, 'decryptedFile.csv'));
                }
            }
    
            // Close the SFTP connection
            await sftp.end();
        } catch (err) {
            // Handle any errors that occurred
            console.log(err);
        }
});


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

cron.schedule('0 15 7-9 * * *', async () => {
    let today = new Date();
    let mm = String(today.getMonth() + 1).padStart(2, '0');
    let dd = String(today.getDate()).padStart(2, '0');
    let yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    let fileName = `COSM_${today}.gpg`;
    var fileNamesToFeth = [fileName]
    var parsedResults = [];
    try {
        await sftp.connect({
            host: 'ezy-sftp.atcoretec.com',
            port: '22',
            username: 'dmc_cosmo',
            password: '~f0q/ugRR*K]',
        });
        const list = await sftp.list('/dmc_cosmo/Cosmo/outgoing/live');
        for (var i = 0; i < fileNamesToFeth.length; i++) {
            const cryptFile = list.find((file) => file.name === fileNamesToFeth[i].trim());
            // download the file
            if(!cryptFile) return;
            const downloadedFilePath = path.join(__dirname, cryptFile.name);
            await sftp.get(`/dmc_cosmo/Cosmo/outgoing/live/${cryptFile.name}`, downloadedFilePath);
            // decrypt the file
            await decryptGpgFile(downloadedFilePath, path.join(__dirname, 'decryptedFile.csv'));
            // read the decrypted file
            const decryptedData = await fs.promises.readFile(path.join(__dirname, 'decryptedFile.csv'), 'utf8');
            console.log(decryptedData);
            var parsedFile = [];
            await new Promise((resolve, reject) => {
                Papa.parse(decryptedData, {
                    header: false,
                    skipEmptyLines: true,
                    complete: (results) => {
                        parsedFile = results.data;
                        resolve();
                    },
                    error: (err) => {
                        reject(err);
                    }
                });
            });
            parsedResults = [...parsedResults, ...parsedFile];
            // delete the downloaded and decrypted files
            fs.unlinkSync(downloadedFilePath);
            fs.unlinkSync(path.join(__dirname, 'decryptedFile.csv'));
        }
        await sftp.end();
        const sendtoMainService = await axios.post('https://shark-app-zyalp.ondigitalocean.app/api/v1/csv', parsedResults);
        console.log(sendtoMainService.data);


    }
    catch (err) {
        console.log(err);
    }
});
// Schedule a cron job to run every day between 7 AM and 9 AM
cron.schedule('0 15 15-20 * * *', async () => {
    // Get the current date
    let today = new Date();
    let mm = String(today.getMonth() + 1).padStart(2, '0');
    let dd = String(today.getDate()).padStart(2, '0');
    let yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;

    // Construct the file name for today
    let fileName = `COSM_${today}.gpg`;

    // Get the file name for yesterday
    let yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    let yyyyPrev = yesterday.getFullYear();
    let mmPrev = String(yesterday.getMonth() + 1).padStart(2, '0');
    let ddPrev = String(yesterday.getDate()).padStart(2, '0');
    yesterday = yyyyPrev + '-' + mmPrev + '-' + ddPrev;
    let prevFileName = `COSM_${yesterday}.gpg`;

    // Set the file names to fetch
    let fileNamesToFetch = [fileName];

    try {
        // Connect to the SFTP server
        await sftp.connect({
            host: 'ezy-sftp.atcoretec.com',
            port: '22',
            username: 'dmc_cosmo',
            password: '~f0q/ugRR*K]', // Replace with your actual password
        });

        // Get the list of files in the FTP directory
        const list = await sftp.list('/dmc_cosmo/Cosmo/outgoing/live');

        // Check if the file for yesterday has been processed
        const processedFiles = fs.readFileSync(path.join(__dirname, 'processed_files.txt'), 'utf-8').split('\n').filter(Boolean);
        if (!processedFiles.includes(prevFileName)) {
            // If the file for yesterday has not been processed, add it to the list of files to fetch
            fileNamesToFetch.push(prevFileName);
        }
           let missedFileName = 'COSM_2023-11-14.gpg';
    fileNamesToFetch.push(missedFileName);
          // Create the 'cosmo_files' directory if it doesn't exist
        const cosmoFilesDir = path.join(__dirname, 'cosmo_files');
        if (!fs.existsSync(cosmoFilesDir)) {
            fs.mkdirSync(cosmoFilesDir);
        }
        // Loop through the file names to fetch
        for (let i = 0; i < fileNamesToFetch.length; i++) {
            // Find the file in the FTP directory
            const cryptFile = list.find((file) => file.name === fileNamesToFetch[i].trim());

            if (cryptFile) {
                // Download the file
                const downloadedFilePath = path.join(__dirname, cryptFile.name);
                await sftp.get(`/dmc_cosmo/Cosmo/outgoing/live/${cryptFile.name}`, downloadedFilePath);

                // Decrypt the file
                await decryptGpgFile(downloadedFilePath, path.join(__dirname, 'decryptedFile.csv'));

                // Read the decrypted file
                const decryptedData = await fs.promises.readFile(path.join(__dirname, 'decryptedFile.csv'), 'utf8');
                console.log(decryptedData);
                //write decrypted data into a file in cosmo dir
                const decryptedFilePath = path.join(cosmoFilesDir, `${cryptFile.name.replace(/\.gpg$/, '.csv')}`);
                await fs.promises.writeFile(decryptedFilePath, decryptedData);
                // Parse the decrypted CSV data
                const parsedFile = [];
                await new Promise((resolve, reject) => {
                    Papa.parse(decryptedData, {
                        header: false,
                        skipEmptyLines: true,
                        complete: (results) => {
                            parsedFile.push(...results.data);
                            resolve();
                        },
                        error: (err) => {
                            reject(err);
                        }
                    });
                });

                // Send the parsed data to the main service
                const sendtoMainService = await axios.post('https://shark-app-zyalp.ondigitalocean.app/api/v1/csv', parsedFile);
                console.log(sendtoMainService.data);

                // Append the processed file name to the processed_files.txt file
                fs.appendFileSync(path.join(__dirname, 'processed_files.txt'), `\n${cryptFile.name}`);

                // Delete the downloaded and decrypted files
                fs.unlinkSync(downloadedFilePath);
                fs.unlinkSync(path.join(__dirname, 'decryptedFile.csv'));
            }
        }

        // Close the SFTP connection
        await sftp.end();
    } catch (err) {
        // Handle any errors that occurred
        console.log(err);
    }
});
