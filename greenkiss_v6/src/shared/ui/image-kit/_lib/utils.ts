const fullPercentCrop: PercentCrop = { unit: "%", x: 0, y: 0, width: 100, height: 100 };

const aspectCrop = makeAspectCrop(
  fullPercentCrop,
  ratio,
  imgWidth,
  imgHeight,
);

const pixelCrop: PixelCrop = {
  unit: "px",
  x: (aspectCrop.x / 100) * imgWidth,
  y: (aspectCrop.y / 100) * imgHeight,
  width: (aspectCrop.width / 100) * imgWidth,
  height: (aspectCrop.height / 100) * imgHeight,
};
