import onChange from 'on-change';

export default (state, elements) => {
  const watchedState = onChange(state, (path) => {
    const { input, feedback } = elements;
    switch (path) {
      case 'form':
        if (state.form.valid) {
          input.classList.remove('is-invalid');
          feedback.classList.remove('text-danger');
          feedback.textContent = '';
        } else {
          console.log(state.form.error);
          input.classList.add('is-invalid');
          feedback.classList.add('text-danger');
          feedback.textContent = state.form.error;
        }
        break;
      default:
        break;
    }
  });
  return watchedState;
};
