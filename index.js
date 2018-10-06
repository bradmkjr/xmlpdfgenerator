const express = require('express');
const router = express.Router();
const eyes = require('eyes');
const https = require('https');
const fs = require('fs');
const xml2js = require('xml2js');
const parser = new xml2js.Parser();
const PDFDocument = require('pdfkit');
const md5 = require('md5');
const cache = require('sqlcachedb');

const url = process.env.URL || 'http://example.com';

console.log(url);
console.log(md5(url));

const app = express();
const port = process.env.PORT || 3000;

cache.getCache(md5(url), function(err,data){
	if(data == undefined){
		// No data, do the request
		https.get( url, function(res) {
		    var response_data = '';
		    res.setEncoding('utf8');
		    res.on('data', function(chunk) {
		        response_data += chunk;
		    });
		    res.on('end', function() {
		        parser.parseString(response_data, function(err, result) {
		            if (err) {
		                console.log('Got error: ' + err.message);
		            } else {
		            	cache.setCache(md5(url), JSON.stringify(result), wwwServer(result));
					}
		        });
		    });
		    res.on('error', function(err) {
		        console.log('Got error: ' + err.message);
		    });
		});
	}else{
		// console.log(data);
		wwwServer(JSON.parse(data));
	}

})

function wwwServer(data){
	console.log('www Server');
	console.log(data.properties.property.length);

	app.get('/', (req, res) => {
		const doc = new PDFDocument();
		let filename = 'hot-sheet-9-28-2018';
		filename = encodeURIComponent(filename) + '.pdf';
		// Setting response to 'attachment' (download).
		// If you use 'inline' here it will automatically open the PDF
		// res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
		res.setHeader('Content-type', 'application/pdf');
		doc.y = 50;
		doc.x = 50;
		for (let i = 0; i < data.properties.property.length; i++) {
			// let i = 0;
			const property = data.properties.property[i];
			// console.log(property);
		    doc.font('Helvetica-Bold').fontSize(18).text(property.title);
		    doc.font('Helvetica').fontSize(14).text(property.city+' '+property.state);
		    doc.fontSize(12);
		    doc.text('Status: ',{continued: true}).fillColor('green').text(property.status);
		    doc.fontSize(12).fillColor('black');
		    // doc.fontSize(12).fillColor('black').list(property.types);
		    // doc.fontSize(12).list(property.features);
		    // console.log(property.types[0]);
		    if( undefined !== property.types[0] && undefined !== property.types[0].type ){
		    	doc.font('Helvetica-Bold').text('Types: ',{continued: true});
		    	doc.font('Helvetica').text(property.types[0].type.join(', '));
		    	// console.log(property.types.type.length);
		    	// console.log(property.types);
		    }
		    if( undefined !== property.features[0].feature && 0 < property.features[0].feature.length ){
		    	doc.font('Helvetica-Bold').text('Features: ',{continued: true});
		    	doc.font('Helvetica').text(property.features[0].feature.join(', '));
		    	// console.log(property.features.feature);
		    }
		    doc.fontSize(10)
		       .text(property.description,
		       		 {  align: 'justify',
		       		    width: 500,
		       		    height: 100,
		       		    ellipsis: true
		       		  });
		    // console.log(property.images[0].image[0]);
		    // if( property.images !== undefined ){
		    	// const img = new Buffer(property.images[0].image[0], 'base64');
				// doc.image(img); // fit: [100, 100]
			    // doc.image('images/test.jpeg', 320, 15, fit: [100, 100]);
		    // }
		    // doc.text('<!--- ---->');
		    // doc.lineTo(400, 90).stroke();
		    doc.moveDown();
		    doc.moveTo( doc.x, doc.y).lineTo(550, doc.y).stroke();
		    doc.moveDown();
		}

		doc.pipe(res);
		doc.end();

	});

	app.listen(port, () => console.log(`PDF Server listening on port ${port}!`))

}



// router.get('/', (req, res) => {
//   const doc = new PDFDocument()
//   // let filename = req.body.filename
//   // Stripping special characters
//   const filename = 'hot-sheet-9-28-2018';
//   filename = encodeURIComponent(filename) + '.pdf'
//   // Setting response to 'attachment' (download).
//   // If you use 'inline' here it will automatically open the PDF
//   res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"')
//   res.setHeader('Content-type', 'application/pdf')
//   const content = req.body.content
//   doc.y = 300
//   doc.text(content, 50, 50)
//   doc.pipe(res)
//   doc.end()
// })

// const express = require('express')


// app.get('/', (req, res) => {
// const doc = new PDFDocument();
// let filename = 'hot-sheet-9-28-2018';
// filename = encodeURIComponent(filename) + '.pdf';
// // Setting response to 'attachment' (download).
// // If you use 'inline' here it will automatically open the PDF
// // res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
// res.setHeader('Content-type', 'application/pdf');
// doc.y = 50;
// doc.x = 50;
// // for (let i = 0; i < result.properties.property.length; i++) {
// 	let i = 0;
// 	const property = result.properties.property[i];
//     doc.text(property.title);
//     console.log(property.images[0].image[0]);
//     if( property.images !== undefined ){
//     	const img = new Buffer(property.images[0].image[0], 'base64');
// 		doc.image(img); // fit: [100, 100]
// 	    // doc.image('images/test.jpeg', 320, 15, fit: [100, 100]);
//     }
// // }

// doc.pipe(res);
// doc.end();

// });

// app.listen(port, () => console.log(`Example app listening on port ${port}!`))
