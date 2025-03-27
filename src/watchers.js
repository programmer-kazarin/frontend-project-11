import onChange from 'on-change';

const handleForm = (state, elements, i18next) => {
  const { input, feedback } = elements;
  if (state.form.valid) {
    input.classList.remove('is-invalid');
    input.value = '';
    feedback.classList.remove('text-danger');
    input.focus();
  } else {
    input.classList.add('is-invalid');
    feedback.classList.add('text-danger');
    feedback.textContent = i18next.t(`errors.${state.form.error}`);
  }
};

const handleLoadingStatus = (state, elements, i18next) => {
  const { input, feedback, submit } = elements;
  const { loading } = state;
  switch (loading.status) {
    case 'failed':
      submit.disable = false;
      input.removeAttribute('readonly');
      feedback.classList.add('text-danger');
      feedback.textContent = i18next.t(`errors.${loading.error}`);
      break;
    case 'success':
      submit.disable = false;
      input.removeAttribute('readonly');
      input.value = '';
      feedback.classList.add('text-success');
      feedback.textContent = i18next.t('loading.success');
      input.focus();
      break;
    case 'loading':
      submit.disable = true;
      input.setAttribute('readonly', true);
      feedback.classList.remove('text-success');
      feedback.classList.remove('text-danger');
      feedback.textContent = '';
      break;
    default:
      throw new Error(`Unknown loading status: ${loading.status}`);
  }
};

const handleFeeds = (state, elements, i18next) => {
  const feedsEl = elements.feeds;
  feedsEl.innerHTML = '';
  if (state.feeds.length > 0) {
    const cardBoarder = document.createElement('div');
    cardBoarder.classList.add('card-border-0');

    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    const cardTitle = document.createElement('h2');
    cardBody.classList.add('card-title', 'h4');
    cardBody.textContent = i18next.t('feeds');
    cardBody.append(cardTitle);

    const listGroupBorder = document.createElement('ul');
    listGroupBorder.classList.add('list-group', 'border-0', 'rounded-0');
    state.feeds.forEach((feed) => {
      const listGroupItem = document.createElement('li');
      listGroupItem.classList.add('list-group-item', 'border-0', 'border-end-0');

      const titleEl = document.createElement('h3');
      titleEl.classList.add('h6', 'm-0');
      titleEl.textContent = feed.title;
      listGroupItem.append(titleEl);

      const descriprionEl = document.createElement('p');
      descriprionEl.classList.add('m-0', 'small', 'text-black-50');
      descriprionEl.textContent = feed.description;
      listGroupItem.append(descriprionEl);

      listGroupBorder.append(listGroupItem);
    });

    cardBody.append(listGroupBorder);
    cardBoarder.append(cardBody);
    feedsEl.append(cardBoarder);
  }
};

const handlePosts = (state, elements, i18next) => {
  const postsEl = elements.posts;
  postsEl.innerHTML = '';
  if (state.posts.length > 0) {
    const cardBoarder = document.createElement('div');
    cardBoarder.classList.add('card-border-0');

    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    const cardTitle = document.createElement('h2');
    cardBody.classList.add('card-title', 'h4');
    cardBody.textContent = i18next.t('posts');
    cardBody.append(cardTitle);

    const listGroupBorder = document.createElement('ul');
    listGroupBorder.classList.add('list-group', 'border-0', 'rounded-0');
    state.posts.forEach((post) => {
      const listGroupItem = document.createElement('li');
      listGroupItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

      const hrefEl = document.createElement('a');
      hrefEl.setAttribute('href', post.link);
      if (state.seenPosts.has(post.id)) {
        hrefEl.classList.add('fw-normal');
      } else {
        hrefEl.classList.add('fw-bold');
      }
      hrefEl.setAttribute('data-id', post.id);
      hrefEl.setAttribute('target', '_blank');
      hrefEl.setAttribute('rel', 'oopener noreferrer');
      hrefEl.textContent = post.title;
      listGroupItem.append(hrefEl);

      const buttonEl = document.createElement('button');
      buttonEl.setAttribute('type', 'button');
      buttonEl.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      buttonEl.setAttribute('data-id', post.id);
      buttonEl.setAttribute('data-bs-toggle', 'modal');
      buttonEl.setAttribute('data-bs-target', '#modal');
      buttonEl.textContent = i18next.t('view');
      listGroupItem.append(buttonEl);

      listGroupBorder.append(listGroupItem);
    });

    cardBody.append(listGroupBorder);
    cardBoarder.append(cardBody);
    postsEl.append(cardBoarder);
  }
};

const handleModal = (state, elements) => {
  const modalEl = elements.modal;
  const postToShow = state.posts.filter((post) => post.id === state.modal.postId)[0];
  modalEl.querySelector('.modal-title').textContent = postToShow.title;
  modalEl.querySelector('.modal-body').textContent = postToShow.description;
  modalEl.querySelector('.btn-primary').setAttribute('href', postToShow.link);
};

export default (state, elements, i18next) => {
  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'form':
        handleForm(state, elements, i18next);
        break;
      case 'loading':
      case 'loading.status':
        handleLoadingStatus(state, elements, i18next);
        break;
      case 'feeds':
        handleFeeds(state, elements, i18next);
        break;
      case 'posts':
      case 'seenPosts':
        handlePosts(state, elements, i18next);
        break;
      case 'modal.postId':
        handleModal(state, elements);
        break;
      default:
        break;
    }
  });
  return watchedState;
};
