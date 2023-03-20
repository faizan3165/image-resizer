const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const resizeImg = require('resize-img');

const isMac = process.platform === 'darwin';

let mainWindow;

function createMainWindow() {
	mainWindow = new BrowserWindow({
		title: 'Image Resizer',
		width: 500,
		height: 600,
		webPreferences: {
			contextIsolation: true,
			nodeIntegration: true,
			preload: path.join(__dirname, './preload.js')
		}
	});

	mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
}

function createAboutWindow() {
	const aboutWindow = new BrowserWindow({
		title: 'About',
		width: 300,
		height: 300
	});

	aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'));
}

app.whenReady().then(() => {
	createMainWindow();

	const mainMenu = Menu.buildFromTemplate(menu);
	Menu.setApplicationMenu(mainMenu);

	mainWindow.on('closed', () => {
		mainWindow = null;
	});

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createMainWindow();
		}
	});
});

const menu = [
	...(isMac
		? [
				{
					label: app.name,
					submenu: [
						{
							label: 'About',
							click: createAboutWindow
						}
					]
				}
			]
		: []),
	{
		role: 'fileMenu'
	},
	...(!isMac
		? [
				{
					label: 'Help',
					submenu: [
						{
							label: 'About',
							click: createAboutWindow
						}
					]
				}
			]
		: [])
];

ipcMain.on('image:resize', (e, options) => {
	resizeImage(options);
});

async function resizeImage({ imgPath, width, height, dest }) {
	try {
		const newPath = await resizeImg(fs.readFileSync(imgPath), {
			width: +width,
			height: +height
		});

		const fileExt = path.extname(imgPath);
		const fileName = path.basename(imgPath).split('.')[0];
		const newFileName = `${fileName}-resized${fileExt}`;

		if (!fs.existsSync(dest)) {
			fs.mkdirSync(dest);
		}

		fs.writeFileSync(path.join(dest, newFileName), newPath);

		mainWindow.webContents.send('image:done');

		shell.openPath(dest);
	} catch (error) {
		console.log(error.message);
	}
}

app.on('window-all-closed', () => {
	if (!isMac) {
		app.quit();
	}
});
