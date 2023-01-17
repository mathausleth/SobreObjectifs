const FS = require('fs');
const HTTP = require('http');
const { SOBRE } = require('./SOBRE/SOBRE.js.js');

SOBRE.FILE.driver = FS;
SOBRE.HTTP.driver = HTTP.createServer();

// En Sobre v2 les utilisateurs permettent de définir le DOM.
const utilisateur = new SOBRE.CLASS.UTILISATEUR('');
utilisateur.DefinirDOM(2000, 980); // On définit ici la taille du visuel lors de la création des requierment du DOM.
// On récupère les ressources textex et images.
SOBRE.FILE.LireFichier('./MathausLethLogo.png', new SOBRE.CLASS.DIMENSION2D(512, 512));
SOBRE.FILE.LireFichier('./objectifs.json');
// On définit la fonction qui va générer la page html
const app = function (request, response) {
	const appDiv = SOBRE.COMPONENT.AppFrame(utilisateur);
	// 2 - On lui donne les fonctionnalitées de bordures:
	SOBRE.DISPLAY.STYLE.Bordurer(appDiv);
	// 3 - On définit ses bordures, ici une à une:
	appDiv.BorderTop(50, 'solid', SOBRE.CONTROL.ENUM.COULEUR.ALPHA.TBLEU)
		.BorderLeft(50, 'solid', SOBRE.CONTROL.ENUM.COULEUR.ALPHA.TBLEU)
		.BorderBottom(50, 'solid', SOBRE.CONTROL.ENUM.COULEUR.ALPHA.TROSE)
		.BorderRight(50, 'solid', SOBRE.CONTROL.ENUM.COULEUR.ALPHA.TROSE);
	// ##### DIV DU CONTENU ####
	// 4 - On créé une div qui va contenir les différents élements de la page et on lui donne les fonctionnalitées de bordures:
	const contentDiv = SOBRE.DISPLAY.OBJECT.CreerElement(appDiv, 'div');
	SOBRE.DISPLAY.STYLE.Bordurer(contentDiv);
	// 5 - On applique les différents élements de styles à la div de contenu:
	contentDiv.Fit() // On définit sa taille à celle du parent
		.Border(6); // Une bordure de 6
	// 6 - On créé la structure de la div de contenue, ici un découpage manuel en 3 parties:
	const header = SOBRE.DISPLAY.OBJECT.CreerElement(contentDiv, 'div')
		.Float('left')
		.Size(1888, 68);
	const objectif = SOBRE.DISPLAY.OBJECT.CreerElement(contentDiv, 'div')
		.Float('left')
		.Size(1888, 760);
	const footer = SOBRE.DISPLAY.OBJECT.CreerElement(contentDiv, 'div')
		.Float('left')
		.Size(1888, 40);
	// 7 - On décrit le header:
	SOBRE.DISPLAY.STYLE.Textualiser(header);
	header.LineHeight(68)
		.FontSize('40px')
		.FontStyle('italic')
		.FontVariant('small-caps')
		.FontWeight('bold')
		.HorizontalAlign('center');
	header.innerHTML = "Objectifs  Janvier / Février  2023";
	pushLogo(header).Float('left');
	SOBRE.DISPLAY.STYLE.Styliser(pushLogo(header).Float('right'), 'transform', 'scaleX(-1)');
	// 8 - On décrit le footer:
	SOBRE.DISPLAY.STYLE.Textualiser(footer);
	footer.LineHeight(40)
		.FontSize('24px')
		.FontStyle('italic')
		.FontWeight('bold')
		.FontVariant('small-caps');
	pushLogo(footer).Float('left');
	SOBRE.DISPLAY.STYLE.Styliser(pushLogo(footer).Float('right'), 'transform', 'scaleX(-1)');
	// 9a - On décrit la div principale:
	var legend = ["OK: Ok pour le moment", "WIP: En cours", " NEXT: Prochainement", "STBY: En pause", "PROTO: Prototype"];
	var spans = []; // contiendr la liste des spans de chaque éléments de la légende
	legend.forEach((abbr) => {
		var span = SOBRE.DISPLAY.OBJECT.CreerElement(footer, 'span').Float('left');
		SOBRE.DISPLAY.STYLE.Aligner(span);
		span.Padding('55px', 'left');
		span.innerHTML = abbr;
		SOBRE.DISPLAY.STYLE.Textualiser(span);
		spans.push(span);
	});
	// 9b - On spécifie la couleur de chaque légende:
	spans[0].Padding('400px', 'left').Color('blue');
	spans[1].Color('green');
	spans[2].Color('orange');
	spans[3].Color('red');
	spans[4].Color('black');
	// 10 - On découpe la div principale en 2 parties: 
	const firstSpan = SOBRE.DISPLAY.OBJECT.CreerElement(objectif, 'span');
	const secondSpan = SOBRE.DISPLAY.OBJECT.CreerElement(objectif, 'span'); 
	// 10a - On décrit chaque partie:
	// note: c'est un prototype, ^^ oui ça fait copier/coller
	//1st
	firstSpan.Float('left')
		.Size(50, 100, '%', '%');
	const firstSpanMonth = SOBRE.DISPLAY.OBJECT.CreerElement(firstSpan, 'div');
	const firstSpanTask = SOBRE.DISPLAY.OBJECT.CreerElement(firstSpan, 'div');
	const firstSpanFooter = SOBRE.DISPLAY.OBJECT.CreerElement(firstSpan, 'div');
	firstSpanMonth.Size(944, 40);
	firstSpanTask.Size(944, 700);
	firstSpanFooter.Size(944, 20);
	SOBRE.DISPLAY.STYLE.Bordurer(firstSpanTask);
	firstSpanTask.BorderRight();
	//2nd
	secondSpan.Float('left')
		.Size(50, 100, '%', '%');
	const secondSpanMonth = SOBRE.DISPLAY.OBJECT.CreerElement(secondSpan, 'div');
	const secondSpanTask = SOBRE.DISPLAY.OBJECT.CreerElement(secondSpan, 'div');
	const secondSpanFooter = SOBRE.DISPLAY.OBJECT.CreerElement(secondSpan, 'div');
	secondSpanMonth.Size(944, 40);
	secondSpanTask.Size(944, 700);
	secondSpanFooter.Size(944, 20);
	SOBRE.DISPLAY.STYLE.Bordurer(secondSpanTask);
	secondSpanTask.BorderLeft();
	// 11 - On utilise le fichier json pour remplir le contenu de chaque partie:
	const firstList = formatContentStructure(firstSpanTask, 3);
	const secondList = formatContentStructure(secondSpanTask, 5);
	var jsonfile = JSON.parse(SOBRE.FILE.files['./objectifs.json'].file);
	firstList.forEach((line, index) => {
		line.checkbox.innerHTML = jsonfile.first[index].check;
		line.text.innerHTML = jsonfile.first[index].name;
		colorise(line.checkbox, line.checkbox.innerHTML);
	});
	secondList.forEach((line, index) => {
		line.checkbox.innerHTML = jsonfile.second[index].check;
		line.text.innerHTML = jsonfile.second[index].name;
		colorise(line.checkbox, line.checkbox.innerHTML);
	});
	// ##### REQUEST ####
	// On ajoute le formatage de la réponse.
	// A noter qu'il ne s'agit pas ici de la bonne méthode pour le faire car cette réponse sera renvoyé pour chaque requête (même .ico, .css, .js etc ..)
	// Pour un souci d'exemple, on acceptera cette méthode.
	response.writeHead(200, {'Content-Type' : 'text/html; charset=utf-8'});
	response.write(`<!DOCTYPE html>\n<html>\n<head>\n<title>Mathaus LETH - OBJECTIFS</title>\n<style>html, body { margin: 0; padding: 0; }</style>\n<meta charset="UTF-8">\n<meta name="author" content="Mathaus LETH">\n</head>\n<body>${utilisateur.body.innerHTML}</body>\n</html>\n`);
	SOBRE.HTTP.FormaterReponse(request, response);
};

const formatContentStructure = function (parent, indent) {
	const a = SOBRE.DISPLAY.OBJECT.CreerElement(parent, 'div');
	const b = SOBRE.DISPLAY.OBJECT.CreerElement(parent, 'div');
	a.Size(10, 100, '%', '%').Float('left');
	b.Size(90, 100, '%', '%').Float('left');
	const tab = [];
	for (var i=0; i < 11; i++) {
		const c = SOBRE.DISPLAY.OBJECT.CreerElement(b, 'span');
		const d = SOBRE.DISPLAY.OBJECT.CreerElement(b, 'span');
		SOBRE.DISPLAY.STYLE.Textualiser(c);		
		SOBRE.DISPLAY.STYLE.Textualiser(d);
		if (i >= indent) {
			c.Size(40, 65, '%').Float('left').LineHeight(40).FontSize('24px').FontVariant('small-caps').HorizontalAlign('center').FontStyle('italic').FontWeight('bold');
			d.Size(60, 65, '%').Float('left').LineHeight(40).FontSize('24px').FontVariant('small-caps').FontWeight('bold');
		} else {
			c.Size(20, 65, '%').Float('left').LineHeight(40).FontSize('24px').FontVariant('small-caps').HorizontalAlign('center').FontStyle('italic').FontWeight('bold');;
			d.Size(80, 65, '%').Float('left').LineHeight(40).FontSize('24px').FontVariant('small-caps').FontWeight('bold');			
		}
		tab.push({checkbox: c, text: d});
	}
	return tab;
}

const colorise = function (parent, text) {
		switch (text) {
				case ("OK"): parent.Color('blue');
					break;
				case ("WIP"): parent.Color('green');
					break;
				case ("NEXT"): parent.Color('orange');
					break;
				case ("STBY"): parent.Color('red');
					break;
				case ("PROTO"): parent.Color('black');
					break;
				default:break;
		}
}

const pushLogo = function (parent) {
	const imgLogo  = SOBRE.FILE.files['./MathausLethLogo.png'];
	const img = SOBRE.DISPLAY.OBJECT.CreerImage(parent, imgLogo.file)
		.Size(40, SOBRE.DISPLAY.FUNCTION.CalculerHauteurImageSelonFichier(imgLogo, 40));
	return (img);
}
SOBRE.HTTP.EcouterRequete(app);
SOBRE.HTTP.driver.listen(80);