import axios from "axios";
import { JSDOM } from "jsdom";
import { getChosenLocation, getLat, getLatLon, getLon, HEADER_ACCEPT, HEADER_USER_AGENT } from "./config";
import { ThreeHourWeatherModel } from "./types/threeHourWeather";


export async function callOut(page: number) {

    const lat = getLat();
    const lon = getLon();
    const url1 = `https://forecast.weather.gov/MapClick.php?w0=t&w1=td&w2=wc&w3=sfcwind&w3u=1&w4=sky&w5=pop&w6=rh&w7=rain&w8=thunder&w9=snow&w10=fzg&w11=sleet&w13u=0&w14u=1&w15u=1&AheadHour=0&FcstType=digital&textField1=${lat}&textField2=${lon}&site=all&unit=0&dd=&bw=&BackDay.x=65&BackDay.y=3`;
    const url2 = `https://forecast.weather.gov/MapClick.php?w0=t&w1=td&w2=wc&w3=sfcwind&w3u=1&w4=sky&w5=pop&w6=rh&w7=rain&w8=thunder&w9=snow&w10=fzg&w11=sleet&w13u=0&w14u=1&w15u=1&AheadHour=0&FcstType=digital&textField1=${lat}&textField2=${lon}&site=all&unit=0&dd=&bw=&AheadDay.x=46&AheadDay.y=5`;
    const url3 = `https://forecast.weather.gov/MapClick.php?w0=t&w1=td&w2=wc&w3=sfcwind&w3u=1&w4=sky&w5=pop&w6=rh&w7=rain&w8=thunder&w9=snow&w10=fzg&w11=sleet&w13u=0&w14u=1&w15u=1&AheadHour=48&FcstType=digital&textField1=${lat}&textField2=${lon}&site=all&unit=0&dd=&bw=&AheadDay.x=49&AheadDay.y=11`;
   
    const url = page === 1 ? url1 : page === 2 ? url2 : url3;

    const config = {
        url,
        method: 'get',
        headers: {
            'User-Agent': HEADER_USER_AGENT,
            'Accept': HEADER_ACCEPT,
        }
    };

    const response = await axios(config);
    const dom = new JSDOM(response.data);

    let tableNodeArr = [...dom.window.document.querySelectorAll('.contentArea > table:nth-child(3)')];
    if (tableNodeArr.length === 1) {
        const table = tableNodeArr[0];
        return (row: number) => {

            // NOAA renders two tables as a single table, each is 17 high, 
            // so we also pull 17 down to grab the second "table" of data and merge together
            // below both rows for a single piece of data are gathered (like humidity)
            const row1 = [...table.querySelectorAll('tr')][row];
            const row2 = [...table.querySelectorAll('tr')][row + 17];

            const row1Cells = [...row1.querySelectorAll('td > font > b')];
            const row2Cells = [...row2.querySelectorAll('td > font > b')];

            const row1Content = row1Cells.map(x => String(x.textContent));
            const row2Content = row2Cells.map(x => String(x.textContent));

            return [...row1Content, ...row2Content];
        }
    }
    else return (num: number) => { throw "this function should never be executed"; };
}


export async function getParseScrapedData() {

    console.log(`\nWeather from NOAA for ${getChosenLocation()}:\n`);

    // get the 1st, 2nd, and 3rd weather pages from NOAA
    const results = await Promise.all([callOut(1), callOut(2), callOut(3)]);

    const getRows1 = results[0];
    const getRows2 = results[1];
    const getRows3 = results[2];

    function getRows(row: number) {
        const rows = [...getRows1(row), ...getRows2(row), ...getRows3(row)];
        return rows;
    }

    const allDays = getRows(1).filter(x => x.toUpperCase() !== 'DATE');
    const uniqueDays = allDays.reduce((a, b) => !a.includes(b) ? [...a, b] : a, [] as string[]);
    const allHours = getRows(2).filter(x => !isNaN(Number(x)));

    const temperatureColumns = getRows(3);
    const windColumns = getRows(6);
    const skyCoverColumns = getRows(9);
    const precipChanceColumns = getRows(10);
    const humidityColumns = getRows(11);
    const rainColumns = getRows(12);
    const thunderColumns = getRows(13);
    const snowColumns = getRows(14);

    const hourlyWeatherRows = allHours.map((hour, i) => ThreeHourWeatherModel.formModelFromCandidate(({
        temperature: temperatureColumns[i],
        skyCover: skyCoverColumns[i],
        wind: windColumns[i],
        humidity: humidityColumns[i],
        precipChance: precipChanceColumns[i],
        rain: rainColumns[i],
        snow: snowColumns[i],
        thunder: thunderColumns[i],
        hour
    })));

    return {hourlyWeatherRows, uniqueDays};

}