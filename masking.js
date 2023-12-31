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
    room_width: null,
    room_height: null,

    init: function () {
        this.ctx = this.canvas.getContext('2d');
        this.maskCtx = this.maskCanvas.getContext('2d');
        this.imageCtx = this.imageCanvas.getContext('2d');
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

        // Basit code
        
        document.getElementById("productImageUploader").style.display = 'none'
        document.getElementById("product_title").innerText = "Product Image"

    },

    getWidthHeight: function() {
        // Calculate the maximum dimensions while maintaining aspect ratio
        const maxWidth = window.innerWidth; // 20 is a padding value, adjust as needed
        const maxHeight = window.innerHeight; // 20 is a padding value, adjust as needed

        console.log("==");
        console.log(maxWidth, maxHeight);
        console.log("==");
        console.log(this.image.width);

        const aspectRatio = this.image.width / this.image.height;

        let canvasWidth = this.image.width;
        let canvasHeight = this.image.height;

        if (canvasWidth > maxWidth) {
            canvasWidth = maxWidth;
            canvasHeight = maxWidth / aspectRatio;
        }

        if (canvasHeight > maxHeight) {
            canvasHeight = maxHeight;
            canvasWidth = maxHeight * aspectRatio;
        }

        console.log(canvasWidth, canvasHeight);

        this.room_width = canvasWidth;
        this.room_height = canvasHeight;
    },


    handleImageUpload: function () {
        const file = this.imageInput.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            this.image.src = e.target.result;
            this.image.style.display = 'block';
            this.image.style.width = "100%";
            setTimeout(() => {
                this.getWidthHeight();
                this.image.width = this.room_width;
                this.image.height = this.room_height;
                this.loadImageToCanvas();
                this.image.style.opacity = '0';
            }, 5);
        };

        reader.readAsDataURL(file);

        // Basit 
        document.getElementById('roomImageUploader').style.display = 'none';
        document.getElementById('generateMaskButton').style.display = "block"
        document.getElementById("room_title").innerText = "Room Image"

    },
    

    loadImageToCanvas: function () {
        this.image.width = this.room_width;
        this.image.height = this.room_height;
        this.canvas.width = this.room_width;
        this.canvas.height = this.room_height;
        this.maskCanvas.width = this.room_width;
        this.maskCanvas.height = this.room_height;
        this.imageCanvas.width = this.room_width;
        this.imageCanvas.height = this.room_height;
        this.ctx.drawImage(this.image, 0, 0, this.room_width, this.room_height);
        this.imageCtx.drawImage(this.image, 0, 0, this.room_width, this.room_height);            

    },

    startDrawing: function (e) {
        e.preventDefault();
        this.ctx.clearRect(0, 0, this.room_width, this.room_height);
        this.ctx.drawImage(this.image, 0, 0, this.room_width, this.room_height);

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
            this.ctx.clearRect(0, 0, this.room_width, this.room_height);
            this.ctx.drawImage(this.image, 0, 0, this.room_width, this.room_height);
        }
    },

    generateMask: function () {
        this.maskCtx.clearRect(0, 0, this.room_width, this.room_height);
        this.maskCtx.fillStyle = 'black';
        this.maskCtx.fillRect(0, 0, this.room_width, this.room_height);

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
        this.pos_prompt = document.getElementById('posPromptInput').value;
        this.neg_prompt = document.getElementById('negPromptInput').value;
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