import './App.css'

import React, { useState, useRef, useEffect } from 'react';

const App = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isErasing, setIsErasing] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    images.forEach((img) => {
      ctx.drawImage(img.element, img.x, img.y);
    });
  }, [images]);

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setImages([...images, { element: img, x: 0, y: 0 }]);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const clickedImage = images.find((img) => 
      x >= img.x && x <= img.x + img.element.width &&
      y >= img.y && y <= img.y + img.element.height
    );

    if (clickedImage) {
      setSelectedImage(clickedImage);
    }
  };

  const handleMouseMove = (e) => {
    if (selectedImage) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setImages(images.map((img) =>
        img === selectedImage ? { ...img, x, y } : img
      ));
    }
  };

  const handleMouseUp = () => {
    setSelectedImage(null);
  };

  const toggleEraser = () => {
    setIsErasing(!isErasing);
  };

  const handleErase = (e) => {
    if (isErasing) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2, false);
      ctx.fill();
    }
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="mb-4">
        <button
          className={`px-4 py-2 rounded ${isErasing ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}
          onClick={toggleEraser}
        >
          {isErasing ? 'Disable Eraser' : 'Enable Eraser'}
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border border-gray-300 bg-white"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onMouseDown={handleMouseDown}
        onMouseMove={(e) => {
          handleMouseMove(e);
          handleErase(e);
        }}
        onMouseUp={handleMouseUp}
      />
      <p className="mt-4 text-gray-600">Drag and drop images onto the canvas</p>
    </div>
  );
};

export default App;

