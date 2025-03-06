import onChange from 'on-change';

export default (initState, elements) => {
  const watchedState = onChange(initState, (path) => {
    console.log(`State "${path}" has bean changed`);
  });
  return watchedState;
};
