document.addEventListener("DOMContentLoaded", () => {
    const fireflyContainer = document.createElement("div");
    fireflyContainer.classList.add("firefly-container");
  
    for (let i = 0; i < 50; i++) {
      const firefly = document.createElement("div");
      firefly.classList.add("firefly");
  
      // Randomize position and animation delay
      firefly.style.left = `${Math.random() * 100}vw`;
      firefly.style.top = `${Math.random() * 100}vh`;
      firefly.style.animationDelay = `${Math.random() * 10}s`;
      firefly.style.animationDuration = `${10 + Math.random() * 10}s`;
  
      fireflyContainer.appendChild(firefly);
    }
  
    document.body.appendChild(fireflyContainer);
  });
  