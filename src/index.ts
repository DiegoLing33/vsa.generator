import fetch from "node-fetch";
import cheerio from "cheerio";
import {createCanvas, loadImage} from "canvas";
import * as fs from "fs";
import express from "express";
import {Logger} from "@ling.black/log";

const app = express();
let cache: Record<string, string[]> = {};

(async () => {
	app.set('views', './views')
	app.set('view engine', 'pug');
	app.get("/create/:key/:type/:page", async (req, res) => {
		let list = await downloadIcons(req.params.key);
		let img = await loadImage(list[parseInt(req.params.page) % list.length]);

		const width = 500
		const height = 500

		const canvas = createCanvas(width, height);
		const context = canvas.getContext('2d');

		switch(String(req.params.type)){
			case "1":
				context.fillStyle = '#e9a854';
				break;
			case "3":
				context.fillStyle = '#fbdb4a';
				break;
			case "4":
				context.fillStyle = '#99c45a';
				break;
			case "5":
				context.fillStyle = '#96cbc8';
				break;
			default:
				context.fillStyle = '#eee';
				break;
		}
		context.fillRect(0, 0, width, height);
		context.drawImage(img, (width - 300) / 2, (height - 300) / 2, 300, 300);
		const buf = canvas.toBuffer("image/png");
		fs.writeFileSync("./src/img.png", buf);
		res.sendFile(__dirname + "/img.png");
	});

	app.get("/", (req, res) => {
		res.sendFile(__dirname + "/html/index.html");
	});

	app.listen(80, "generator.vettrisa.ru", () => {
		Logger.log("Server is listening");
	});

})();


async function getIcons(query: string) {
	const data = await fetch(`https://ru.freepik.com/search?dates=any&format=search&page=1&query=${query}&selection=1&sort=popular&type=icon`);
	return await data.text();
}

async function downloadIcons(query: string){
	Logger.log('Request: ' + query);
	return new Promise<string[]>(async resolve => {
		if(cache[query]) {
			resolve(cache[query]);
			return;
		}
		let list = Array<string>();
		const icons = await getIcons(query);
		const $ = cheerio.load(icons);
		$(".lzy").each((index, element) => {
			if(element.attribs && element.attribs['data-src']){
				if(!element.attribs['data-src'].includes('avatar.free')) {
					console.log(element.attribs['data-src']);
					list.push(element.attribs['data-src']);
				}
			}
		});
		cache[query] = list;
		resolve(list);
	});
}