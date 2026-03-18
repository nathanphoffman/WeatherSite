import { parse } from "csv-parse";
import fs from 'node:fs';

const records = [];
/*
fs.createReadStream('uscities.csv')
.pipe(
   parse{
     columns: true, //use first row as header
     skip_empty_lines: true,
   }
)
.on('data',(row)=>{
   records.push(row);
})
.on('error',(err)=>{
   console.error(err.message);
})
.on('end', ()=>{
    console.log(records);
});
*/
/*
const parser = parse({
    delimiter: ",",
    skip_empty_lines: true,
    columns: true, //use first row as header
});

parser.on("readable", function () {
    let record;
    while ((record = parser.read()) !== null) {
        records.push(record);
    }
});
*/