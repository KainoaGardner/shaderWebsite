function main() {
  const canvas0 = document.getElementById("canvas0") as HTMLCanvasElement;
  const canvas1 = document.getElementById("canvas1") as HTMLCanvasElement;
  if (!canvas0 || !canvas1) {
    console.error("cant find canvases");
    return
  }

  const nextArrow = document.getElementById("nextArrow") as HTMLElement;
  const prevArrow = document.getElementById("prevArrow") as HTMLElement;
  if (!nextArrow || !prevArrow) {
    return;
  }

  prevArrow.addEventListener("click", function() {
    canvas0.style.animation = "moveOut 0.75s ease-in-out reverse"
    canvas1.style.animation = "moveIn 0.75s ease-in-out reverse"
  });

  nextArrow.addEventListener("click", function() {
    canvas0.style.animation = "moveOut 0.75s ease-in-out"
    canvas1.style.animation = "moveIn 0.75s ease-in-out"
  });

  canvas0.addEventListener("animationend", function() {
    canvas0.style.animation = ""
  })

  canvas1.addEventListener("animationend", function() {
    canvas1.style.animation = ""
  })

}




main();

