function showSidebar()
{
    const sidebar = document.querySelector('.sidebar');
    sidebar.style.display = 'flex';
}

function hideSidebar()
{
    const sidebar = document.querySelector('.sidebar');
    sidebar.style.display = 'none';
}

let currentSlide = 0;
function changeSlide(direction) {
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;
  
    if ((currentSlide === totalSlides - 1 && direction === 1) || (currentSlide === 0 && direction === -1)) {
      return;
    }
  
    currentSlide += direction;
    
    const slider = document.querySelector('.slider');
    slider.style.transform = `translateX(-${currentSlide * 100}px)`; 
  }