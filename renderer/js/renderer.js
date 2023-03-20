const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const fileName = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');

function loadImage(e) {
	const file = e.target.files[0];

	if (!validateImageFile(file)) {
		errorAlert('Invalid file type. Please select an image');
		return;
	}

	const image = new Image();
	image.src = URL.createObjectURL(file);
	image.onload = function() {
		widthInput.value = this.width;
		heightInput.value = this.height;
	};

	form.style.display = 'block';
	fileName.value = file.name;
	outputPath.value = path.join(os.homeDir(), 'Pictures/imageResizer');
}

function sendImage(e) {
	e.preventDefault();

	const width = widthInput.value;
	const height = heightInput.value;
	const dest = outputPath.value;
	const imgPath = img.files[0].path;

	if (!img.files[0]) {
		errorAlert('Please upload an image');
		return;
	}

	if (width === '' || height == '') {
		errorAlert('Please enter the width and height of the image');
		return;
	} else if (width === '0' || height === '0') {
		errorAlert('The width or height cannot be 0');
	}

	ipcRenderer.send('image:resize', {
		imgPath,
		dest,
		width,
		height
	});
}

ipcRenderer.on('image:done', () => {
	successAlert(`Image successfully resized to ${widthInput.value}x${heightInput.value}`);
});

function validateImageFile(file) {
	const acceptedImgTypes = [ 'image/gif', 'image/png', 'image/jpeg', 'image/jpg' ];

	return file && acceptedImgTypes.includes(file['type']);
}

function errorAlert(message) {
	Toastify.toast({
		text: message,
		duration: 5000,
		style: {
			background: '#f8d7da',
			color: '#842029',
			textAlign: 'center',
			border: '1px solid #f5c2c7',
			borderRadius: '0.375rem',
			paddingHorizontal: '1rem',
			paddingVertical: '1rem'
		}
	});
}

function successAlert(message) {
	Toastify.toast({
		text: message,
		duration: 5000,
		style: {
			background: '#cfe2ff',
			color: '#084298',
			textAlign: 'center',
			border: '1px solid #b6df4e',
			borderRadius: '0.375rem',
			paddingHorizontal: '1rem',
			paddingVertical: '1rem'
		}
	});
}

img.addEventListener('change', loadImage);
form.addEventListener('submit', sendImage);
