import watcher from './watchers.js';

export default () => {
  const elements = {
    form: document.querySelector('.rss-form'),
  };

  const initState = {
    rssLink: '',
  };

  const watchedState = watcher(initState, elements);

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const url = data.get('url');
    watchedState.rssLink = url;
  });
};
