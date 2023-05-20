// Import required Node.js packages
const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const csvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');

// Define a function to get the value of the time
const get_time = (tm) => {
    hm = tm.match(/\d+/g).map(Number);
    if (hm.length == 1 && /hr|hour/.test(tm)) {
        return hm[0] * 60;
    } else if (hm.length == 1) {
        return hm[0];
    } else {
        return hm[0] * 60 + hm[1];
    }
}

// Define a function to write data to CSV file
const write_to_csv = async (out, coordinates, url, tm, dst) => {

    // Check if the output file already exists or not
    if (!fs.existsSync(out)) {
        const header = [
            { id: 'url', title: 'URL' },
            // Add more fields here
        ];

        // Create a new CSV file with header row
        const csvWriterObj = csvWriter({
            path: out,
            header: header
        });

        await csvWriterObj.writeRecords([{
            url: url
            // Add more fields here
        }]);
    } else {
        // Append data to existing CSV file
        const csvWriterObj = csvWriter({
            path: out,
            append: true
        });

        await csvWriterObj.writeRecords([{
            url: url
            // Add more fields here
        }]);
    }
}

const scrap = async (fname) => {
    let opts = new chrome.Options();
    opts.addArguments("--log-level=3", "--headless");

    let driver = new Builder()
        .forBrowser('chrome')
        .setChromeOptions(opts)
        .build();

    let mn = 1800000000000000;
    let crd = '';
    let url = '';
    let total_dst = '';

    try {
        const configFile = fs.readFileSync('../config.txt', 'utf-8');
        console.log(configFile);
        let config = configFile.split('\n').filter(Boolean);
        let start = '';
        let end = '';
        let coords = [];

        for (let i = 0; i < config.length; i++) {
            if (config[i].startsWith('start>')) {
                start = config[i].split('>')[1];
            } else if (config[i].startsWith('end>')) {
                end = config[i].split('>')[1];
            } else {
                coords.push(config[i]);
            }
        }

        // Generate all possible combinations of coordinates
        const permute = (arr, l = 0, r = arr.length - 1, result = []) => {
            if (l === r) {
                result.push([...arr]);
            } else {
                for (let i = l; i <= r; i++) {
                    [arr[l], arr[i]] = [arr[i], arr[l]];
                    permute(arr, l + 1, r, result);
                    [arr[l], arr[i]] = [arr[i], arr[l]];
                }
            }
            return result;
        }
        const routeCoords = permute(coords);
        console.log(routeCoords);

        for (let i = 0; i < routeCoords.length; i++) {
            let st = '';

            if (start.toLowerCase() != 'na' && end.toLowerCase() != 'na') {
                st = [start, ...routeCoords[i], end].join('/');
            } else if (start.toLowerCase() == 'na' && end.toLowerCase() != 'na') {
                st = [...routeCoords[i], end].join('/');
            } else if (start.toLowerCase() != 'na' && end.toLowerCase() == 'na') {
                st = [start, ...routeCoords[i]].join('/');
            }

            const lnk = `https://www.google.com/maps/dir/${st}`;
            console.log(lnk);

            await driver.get(lnk);

            const tmElm = await driver.wait(until.elementLocated(By.xpath('//*[@id="section-directions-trip-0"]/div[1]/div[1]/div[1]/div[1]/span[1]')), 8000);
            const tm = await tmElm.getText();

            const dstElm = await driver.wait(until.elementLocated(By.xpath('//*[@id="section-directions-trip-0"]/div[1]/div[1]/div[1]/div[2]/div')), 8000);
            const dst = await dstElm.getText().trim();

            console.log(`Time found: ${tm}`);
            const currentTm = get_time(tm);

            if (currentTm < mn) {
                mn = currentTm;
                crd = st.replace(/\//g, ',');

                let elm = await driver.wait(until.elementLocated(By.xpath('//*[@id="section-directions-trip-0"]/div[1]/div[1]/div[4]/button')), 8000);
                await driver.executeScript("arguments[0].click();", elm);

                await driver.sleep(5000);
                url = await driver.getCurrentUrl();
                total_dst = dst;
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        await driver.quit();
    }

    write_to_csv(fname, crd, url, `${mn} min`, total_dst);
    console.log(`Shortest path: ${crd} | ${url} | ${mn} | ${total_dst}`);
}

module.exports = scrap;