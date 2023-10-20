// JavaScript object to handle image manipulation and submission
const ImageManipulator = {
    canvas: document.getElementById('canvas'),
    ctx: null,
    image: document.getElementById('selectedImage'),
    imageInput: document.getElementById('imageInput'),
    maskCanvas: document.getElementById('maskCanvas'),
    productImageInput: document.getElementById('productImageInput'),
    productImageViewer: document.getElementById('product-image-view'),
    maskCtx: null,
    imageCanvas: document.getElementById('imageCanvas'),
    imageCtx: null,
    isDrawing: false,
    drawingPath: [],
    previousX: 0,
    previousY: 0,
    pos_prompt: null,
    neg_prompt: null,

    init: function () {
        this.ctx = this.canvas.getContext('2d');
        this.maskCtx = this.maskCanvas.getContext('2d');
        this.imageCtx = this.imageCanvas.getContext('2d');
        this.pos_prompt = document.getElementById('posPromptInput').value;
        this.neg_prompt = document.getElementById('negPromptInput').value;
        this.addEventListeners();
    },

    addEventListeners: function () {
        this.imageInput.addEventListener('change', this.handleImageUpload.bind(this));
        this.productImageInput.addEventListener('change', this.handleProductImageUpload.bind(this));
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        document.getElementById('generateMaskButton').addEventListener('click', this.generateMask.bind(this));
        document.getElementById('show-mask-toggle').addEventListener('change', this.toggleMask.bind(this));
        // document.getElementById('submitBtn').addEventListener('click', this.submitImages.bind(this));
    },

    handleProductImageUpload: function () {
        const file = this.productImageInput.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            this.productImageViewer.src = e.target.result;
            this.productImageViewer.style.display = 'block';
        };

        reader.readAsDataURL(file);
    },


    handleImageUpload: function () {
        const file = this.imageInput.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            this.image.src = e.target.result;
            this.image.style.display = 'block';
            setTimeout(() => {
                this.loadImageToCanvas();
            }, 500);
        };

        reader.readAsDataURL(file);
    },

    loadImageToCanvas: function () {
        this.canvas.width = this.image.width;
        this.canvas.height = this.image.height;
        this.maskCanvas.width = this.canvas.width;
        this.maskCanvas.height = this.canvas.height;
        this.imageCanvas.width = this.canvas.width;
        this.imageCanvas.height = this.canvas.height;

        this.ctx.drawImage(this.image, 0, 0);
        this.imageCtx.drawImage(this.image, 0, 0);
    },

    startDrawing: function (e) {
        e.preventDefault();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.image, 0, 0);

        this.isDrawing = true;
        this.previousX = e.clientX - this.canvas.getBoundingClientRect().left;
        this.previousY = e.clientY - this.canvas.getBoundingClientRect().top;
        this.ctx.beginPath();
        this.ctx.moveTo(this.previousX, this.previousY);
        this.drawingPath = [];
        this.drawingPath.push({ x: this.previousX, y: this.previousY });
    },

    draw: function (e) {
        e.preventDefault();
        if (!this.isDrawing) return;
        const currentX = e.clientX - this.canvas.getBoundingClientRect().left;
        const currentY = e.clientY - this.canvas.getBoundingClientRect().top;

        this.ctx.strokeStyle = 'red';
        this.ctx.lineWidth = 5;
        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';
        this.ctx.lineTo(currentX, currentY);
        this.ctx.stroke();

        this.drawingPath.push({ x: currentX, y: currentY });
        this.previousX = currentX;
        this.previousY = currentY;
    },

    stopDrawing: function () {
        this.isDrawing = false;
        this.ctx.closePath();

        const startPoint = this.drawingPath[0];
        const endPoint = this.drawingPath[this.drawingPath.length - 1];
        const distance = Math.sqrt(
            (endPoint.x - startPoint.x) ** 2 + (endPoint.y - startPoint.y) ** 2
        );

        if (distance < 10) {
            this.ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
            this.ctx.beginPath();
            for (const point of this.drawingPath) {
                this.ctx.lineTo(point.x, point.y);
            }
            this.ctx.closePath();
            this.ctx.fill();
        } else {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.image, 0, 0);
        }
    },

    generateMask: function () {
        this.maskCtx.clearRect(0, 0, this.maskCanvas.width, this.maskCanvas.height);
        this.maskCtx.fillStyle = 'black';
        this.maskCtx.fillRect(0, 0, this.maskCanvas.width, this.maskCanvas.height);

        this.maskCtx.globalCompositeOperation = 'source-over';
        this.maskCtx.fillStyle = 'white';
        this.maskCtx.beginPath();
        for (const point of this.drawingPath) {
            this.maskCtx.lineTo(point.x, point.y);
        }
        this.maskCtx.closePath();
        this.maskCtx.fill();

        document.getElementById('ViewToggleContainer').style.display = 'block';
        document.getElementById('submitBtn').style.display = 'block';
    },

    toggleMask: function () {
        const toggle = document.getElementById('show-mask-toggle');
        if (toggle.checked) {
            this.canvas.style.opacity = '0';
        } else {
            this.canvas.style.opacity = '1';
        }
    },

    canvasToImage: function (canvas) {
        return canvas.toDataURL('image/png');
    },

    prepareFormData: function() {
        const canvasImage = this.canvasToImage(this.canvas);
        const maskCanvasImage = this.canvasToImage(this.maskCanvas);
        const mainImage = this.canvasToImage(this.imageCanvas);
        const productImage = this.productImageViewer.src;
        console.log("=======");
        console.log(productImage);
        console.log("=======");
        // const csrfToken = $('input[name="csrfmiddlewaretoken"]').val();

        const formData = new FormData();
        formData.append('canvasImage', canvasImage);
        formData.append('maskCanvasImage', maskCanvasImage);
        formData.append('mainImage', mainImage);
        formData.append('productImage', productImage);

        formData.append('pos_prompt', this.pos_prompt);
        formData.append('neg_prompt', this.neg_prompt);        
        return formData;

    }
};