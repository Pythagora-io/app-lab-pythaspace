document.addEventListener('DOMContentLoaded', function() {
  const shareButtons = document.querySelectorAll('.share-button');

  shareButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const network = this.dataset.network;
      const url = encodeURIComponent(window.location.href);
      const title = encodeURIComponent(document.title);

      let shareUrl;
      switch(network) {
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
          break;
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`;
          break;
        default:
          console.error('Unsupported network:', network);
          return;
      }

      try {
        window.open(shareUrl, '_blank', 'width=600,height=400');
      } catch (error) {
        console.error('Error opening share URL:', error);
        console.error(error.stack);
      }
    });
  });
});