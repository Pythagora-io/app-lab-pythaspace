document.addEventListener('DOMContentLoaded', function() {
  const magicHelperBtn = document.getElementById('magicHelperBtn');
  const magicHelperModal = new bootstrap.Modal(document.getElementById('magicHelperModal'));
  const magicHelperContent = document.getElementById('magicHelperContent');

  magicHelperBtn.addEventListener('click', async function() {
    const title = document.getElementById('title').value.trim();
    const content = quill.root.innerHTML;

    if (!title) {
      const errorMessage = document.createElement('span');
      errorMessage.textContent = 'Please enter a title before using Magic Helper';
      errorMessage.style.color = 'red';
      errorMessage.style.marginLeft = '10px';
      magicHelperBtn.parentNode.insertBefore(errorMessage, magicHelperBtn.nextSibling);

      setTimeout(() => {
        errorMessage.remove();
      }, 3000);

      return;
    }

    magicHelperContent.innerHTML = '<p>Generating suggestions...</p>';
    magicHelperModal.show();

    try {
      const response = await fetch('/api/articles/magic-helper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      displaySuggestions(data.suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      magicHelperContent.innerHTML = '<p>Error fetching suggestions. Please try again.</p>';
    }
  });

  function displaySuggestions(suggestions) {
    let html = '<ol class="animate__animated animate__fadeIn">';
    suggestions.forEach((heading) => {
      html += `<li><h3 class="animate__animated animate__fadeInLeft">${heading.title}</h3><ol>`;
      heading.subHeadings.forEach(subHeading => {
        html += `<li><h4 class="animate__animated animate__fadeInLeft animate__delay-1s">${subHeading.title}</h4><ol>`;
        subHeading.contentPoints.forEach(point => {
          html += `<li class="animate__animated animate__fadeInLeft animate__delay-2s">${point}</li>`;
        });
        html += '</ol></li>';
      });
      html += '</ol></li>';
    });
    html += '</ol>';
    magicHelperContent.innerHTML = html;
  }
});