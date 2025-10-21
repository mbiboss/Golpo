// Comments module for Golpo stories
// Handles fetching, posting, editing, and deleting comments

let commentsCache = {};

// Helper function to get CSRF token from cookie
function getCsrfToken() {
  const match = document.cookie.match(/csrfToken=([^;]+)/);
  return match ? match[1] : null;
}

// Fetch comments for a story
async function fetchComments(storyId) {
  try {
    const response = await fetch(`/api/comments/${storyId}`);
    if (response.ok) {
      const comments = await response.json();
      commentsCache[storyId] = comments;
      return comments;
    } else {
      throw new Error('Failed to fetch comments');
    }
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

// Post a new comment
async function postComment(storyId, content) {
  try {
    const csrfToken = getCsrfToken();
    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify({ storyId, content }),
    });

    if (response.ok) {
      const comment = await response.json();
      return comment;
    } else if (response.status === 401) {
      showNotification('Please log in to post comments', 'error', 3000);
      return null;
    } else {
      throw new Error('Failed to post comment');
    }
  } catch (error) {
    console.error('Error posting comment:', error);
    showNotification('Failed to post comment', 'error', 3000);
    return null;
  }
}

// Update a comment
async function updateComment(commentId, content) {
  try {
    const csrfToken = getCsrfToken();
    const response = await fetch(`/api/comments/${commentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify({ content }),
    });

    if (response.ok) {
      const comment = await response.json();
      return comment;
    } else if (response.status === 401) {
      showNotification('Please log in to edit comments', 'error', 3000);
      return null;
    } else {
      throw new Error('Failed to update comment');
    }
  } catch (error) {
    console.error('Error updating comment:', error);
    showNotification('Failed to update comment', 'error', 3000);
    return null;
  }
}

// Delete a comment
async function deleteComment(commentId) {
  try {
    const csrfToken = getCsrfToken();
    const response = await fetch(`/api/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'X-CSRF-Token': csrfToken,
      },
    });

    if (response.ok) {
      return true;
    } else if (response.status === 401) {
      showNotification('Please log in to delete comments', 'error', 3000);
      return false;
    } else {
      throw new Error('Failed to delete comment');
    }
  } catch (error) {
    console.error('Error deleting comment:', error);
    showNotification('Failed to delete comment', 'error', 3000);
    return false;
  }
}

// Render comments UI
function renderComments(storyId, comments) {
  const commentsSection = document.getElementById('commentsSection');
  if (!commentsSection) return;

  const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;

  let commentsHTML = `
    <div class="comments-container">
      <h3 class="comments-title english-text">
        <i class="fas fa-comments"></i>
        Comments (${comments.length})
      </h3>
  `;

  // Add comment form if user is logged in
  if (currentUser) {
    commentsHTML += `
      <div class="comment-form">
        <div class="comment-form-header">
          <img src="${currentUser.profileImageUrl || 'assets/logo.png'}" 
               alt="${currentUser.firstName || 'User'}" 
               class="comment-avatar"
               onerror="this.src='assets/logo.png'">
          <textarea id="commentInput" 
                    class="comment-textarea" 
                    placeholder="Share your thoughts about this story..."
                    rows="3"></textarea>
        </div>
        <div class="comment-form-actions">
          <button class="comment-submit-btn" onclick="submitComment('${storyId}')">
            <i class="fas fa-paper-plane"></i>
            Post Comment
          </button>
        </div>
      </div>
    `;
  } else {
    commentsHTML += `
      <div class="comment-login-prompt">
        <i class="fas fa-user-lock"></i>
        <p class="english-text">Please <a href="/api/login" class="login-link">log in</a> to post comments</p>
      </div>
    `;
  }

  // Add comments list
  commentsHTML += '<div class="comments-list">';
  
  if (comments.length === 0) {
    commentsHTML += `
      <div class="no-comments english-text">
        <i class="fas fa-comment-slash"></i>
        <p>No comments yet. Be the first to share your thoughts!</p>
      </div>
    `;
  } else {
    comments.forEach(comment => {
      const isOwner = currentUser && currentUser.id === comment.userId;
      const commentDate = new Date(comment.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      commentsHTML += `
        <div class="comment-item" id="comment-${comment.id}">
          <div class="comment-header">
            <img src="${comment.user.profileImageUrl || 'assets/logo.png'}" 
                 alt="${comment.user.firstName || 'User'}" 
                 class="comment-avatar"
                 onerror="this.src='assets/logo.png'">
            <div class="comment-meta">
              <div class="comment-author english-text">${comment.user.firstName || 'Anonymous'} ${comment.user.lastName || ''}</div>
              <div class="comment-date english-text">${commentDate}</div>
            </div>
            ${isOwner ? `
              <div class="comment-actions">
                <button class="comment-action-btn" onclick="editComment('${comment.id}')" title="Edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="comment-action-btn delete" onclick="confirmDeleteComment('${comment.id}')" title="Delete">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            ` : ''}
          </div>
          <div class="comment-content english-text" id="comment-content-${comment.id}">
            ${escapeHtml(comment.content)}
          </div>
        </div>
      `;
    });
  }

  commentsHTML += '</div></div>';
  commentsSection.innerHTML = commentsHTML;
}

// Submit a new comment
async function submitComment(storyId) {
  const commentInput = document.getElementById('commentInput');
  if (!commentInput) return;

  const content = commentInput.value.trim();
  if (!content) {
    showNotification('Please enter a comment', 'error', 2000);
    return;
  }

  const comment = await postComment(storyId, content);
  if (comment) {
    commentInput.value = '';
    showNotification('Comment posted successfully!', 'success', 2000);
    await loadCommentsForStory(storyId);
  }
}

// Edit a comment
function editComment(commentId) {
  const commentContent = document.getElementById(`comment-content-${commentId}`);
  if (!commentContent) return;

  const currentContent = commentContent.textContent.trim();
  
  commentContent.innerHTML = `
    <textarea class="comment-edit-textarea" id="edit-textarea-${commentId}" rows="3">${currentContent}</textarea>
    <div class="comment-edit-actions">
      <button class="comment-save-btn" onclick="saveEditComment('${commentId}')">
        <i class="fas fa-check"></i> Save
      </button>
      <button class="comment-cancel-btn" onclick="cancelEditComment('${commentId}', \`${escapeHtml(currentContent)}\`)">
        <i class="fas fa-times"></i> Cancel
      </button>
    </div>
  `;
}

// Save edited comment
async function saveEditComment(commentId) {
  const textarea = document.getElementById(`edit-textarea-${commentId}`);
  if (!textarea) return;

  const content = textarea.value.trim();
  if (!content) {
    showNotification('Comment cannot be empty', 'error', 2000);
    return;
  }

  const updatedComment = await updateComment(commentId, content);
  if (updatedComment) {
    const commentContent = document.getElementById(`comment-content-${commentId}`);
    if (commentContent) {
      commentContent.innerHTML = escapeHtml(content);
    }
    showNotification('Comment updated successfully!', 'success', 2000);
  }
}

// Cancel editing
function cancelEditComment(commentId, originalContent) {
  const commentContent = document.getElementById(`comment-content-${commentId}`);
  if (commentContent) {
    commentContent.innerHTML = originalContent;
  }
}

// Confirm delete comment
function confirmDeleteComment(commentId) {
  if (confirm('Are you sure you want to delete this comment?')) {
    deleteCommentById(commentId);
  }
}

// Delete comment by ID
async function deleteCommentById(commentId) {
  const success = await deleteComment(commentId);
  if (success) {
    const commentItem = document.getElementById(`comment-${commentId}`);
    if (commentItem) {
      commentItem.style.opacity = '0';
      setTimeout(() => {
        commentItem.remove();
        showNotification('Comment deleted successfully!', 'success', 2000);
      }, 300);
    }
  }
}

// Load comments for a story
async function loadCommentsForStory(storyId) {
  const comments = await fetchComments(storyId);
  renderComments(storyId, comments);
}

// Utility function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Export to global scope
window.fetchComments = fetchComments;
window.postComment = postComment;
window.updateComment = updateComment;
window.deleteComment = deleteComment;
window.renderComments = renderComments;
window.submitComment = submitComment;
window.editComment = editComment;
window.saveEditComment = saveEditComment;
window.cancelEditComment = cancelEditComment;
window.confirmDeleteComment = confirmDeleteComment;
window.loadCommentsForStory = loadCommentsForStory;
