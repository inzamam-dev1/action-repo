// Helper function to format timestamps
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  // Less than a minute
  if (diff < 60000) {
    return 'just now';
  }

  // Less than an hour
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `${mins}m ago`;
  }

  // Less than a day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }

  // Format as date
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Helper function to get event icon and color
function getEventConfig(action) {
  const configs = {
    PUSH: {
      icon: '<i class="fas fa-code-branch"></i>',
      label: 'Push Event',
      class: 'push'
    },
    PULL_REQUEST: {
      icon: '<i class="fas fa-code-merge"></i>',
      label: 'Pull Request',
      class: 'pull-request'
    },
    MERGE: {
      icon: '<i class="fas fa-check-circle"></i>',
      label: 'Merge',
      class: 'merge'
    },
    TEST: {
      icon: '<i class="fas fa-flask"></i>',
      label: 'Test',
      class: 'test'
    },
    DEFAULT: {
      icon: '<i class="fas fa-circle"></i>',
      label: 'Event',
      class: 'event'
    }
  };

  return configs[action] || configs.DEFAULT;
}

// Function to render an event card
function createEventCard(event) {
  const config = getEventConfig(event.action);
  let description = '';
  let branches = '';

  switch (event.action) {
    case 'PUSH':
      description = `${event.author} pushed code to`;
      branches = `<div class="event-branches">
        <span class="branch-badge to"><i class="fas fa-code-branch"></i> ${event.to_branch}</span>
      </div>`;
      break;

    case 'PULL_REQUEST':
      description = `${event.author} opened a pull request`;
      branches = `<div class="event-branches">
        <span class="branch-badge from"><i class="fas fa-code-branch"></i> ${event.from_branch}</span>
        <i class="fas fa-arrow-right" style="color: #cbd5e0; padding: 2px 5px;"></i>
        <span class="branch-badge to"><i class="fas fa-code-branch"></i> ${event.to_branch}</span>
      </div>`;
      break;

    case 'MERGE':
      description = `${event.author} merged a pull request`;
      branches = `<div class="event-branches">
        <span class="branch-badge from"><i class="fas fa-code-branch"></i> ${event.from_branch}</span>
        <i class="fas fa-arrow-right" style="color: #cbd5e0; padding: 2px 5px;"></i>
        <span class="branch-badge to"><i class="fas fa-code-branch"></i> ${event.to_branch}</span>
      </div>`;
      break;

    case 'TEST':
      description = `${event.author} triggered a test event`;
      break;

    default:
      description = `${event.author} triggered an event`;
  }

  const card = document.createElement('div');
  card.className = `event-card ${config.class}`;
  card.innerHTML = `
    <div class="event-icon">
      ${config.icon}
    </div>
    <div class="event-content">
      <h3 class="event-title">${config.label}</h3>
      <p class="event-description">${description}</p>
      ${branches}
    </div>
    <div class="event-time">${formatTime(event.timestamp)}</div>
  `;

  return card;
}

// Function to load and display events
async function loadEvents() {
  try {
    const res = await fetch('/events');
    const data = await res.json();

    const list = document.getElementById('events');

    if (data.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-inbox"></i>
          <p>No events yet. Waiting for webhooks...</p>
        </div>
      `;
      return;
    }

    list.innerHTML = '';
    data.forEach((event) => {
      const card = createEventCard(event);
      list.appendChild(card);
    });

    // Update total count
    document.getElementById('totalCount').textContent = data.length;

  } catch (error) {
    console.error('Error loading events:', error);
    const list = document.getElementById('events');
    list.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>Error loading events. Please try again.</p>
      </div>
    `;
  }
}

// Refresh button functionality
document.querySelector('.btn-refresh').addEventListener('click', function () {
  this.classList.add('loading');
  loadEvents().then(() => {
    this.classList.remove('loading');
  });
});

// Initial load
loadEvents();

// Refresh every 15 seconds
setInterval(loadEvents, 15000);

// Update time displays every minute
setInterval(() => {
  const timeElements = document.querySelectorAll('.event-time');
  timeElements.forEach(el => {
    // Re-render to update relative times
  });
}, 60000);
