document.addEventListener('DOMContentLoaded', function() {
  const commentForm = document.getElementById('commentForm');
  const commentsList = document.getElementById('commentsList');
  const articleId = window.location.pathname.split('/').pop();

  function loadComments() {
    fetch(`/api/comments/article/${articleId}`)
      .then(response => response.json())
      .then(comments => {
        commentsList.innerHTML = comments.map(comment => `
          <div class="card mb-3">
            <div class="card-body">
              <p class="card-text">${comment.content}</p>
              <p class="card-subtitle mb-2 text-muted">
                By ${comment.author.username} on ${new Date(comment.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        `).join('');
      })
      .catch(error => {
        console.error('Error loading comments:', error);
        console.error(error.stack);
      });
  }

  if (commentForm) {
    commentForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const content = document.getElementById('commentContent').value;

      fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, articleId }),
      })
        .then(response => response.json())
        .then(newComment => {
          loadComments();
          commentForm.reset();
        })
        .catch(error => {
          console.error('Error posting comment:', error);
          console.error(error.stack);
        });
    });
  }

  loadComments();
});