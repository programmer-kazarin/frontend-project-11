const addProxy = (url) => {
  const proxyUrl = new URL('/get', 'https://allorigins.hexlet.app');
  proxyUrl.searchParams.set('url', url);
  proxyUrl.searchParams.set('disableCache', 'true');
  return proxyUrl.toString();
};

const getLoadingErrorType = (error) => {
  if (error.isParsingError) {
    return 'noRss';
  }
  if (error.isAxiosError) {
    return 'network';
  }
  return 'unknown';
};

const parseRss = (xmlData) => {
  console.log('PARSE RSS');
  const dom = new DOMParser().parseFromString(xmlData, 'text/xml');
  const parseError = dom.querySelector('parsererror');
  if (parseError) {
    console.log('PARSE RSS ERROR');
    const error = new Error(parseError.textContent);
    error.isParsingError = true;
    error.data = xmlData;
    throw error;
  }
  console.log('PARSE RSS NO ERROR');
  const channelTitle = dom.querySelector('channel > title').textContent;
  const channelDescription = dom.querySelector('channel > description').textContent;
  const items = [...dom.querySelectorAll('item')].map((item) => ({
    title: item.querySelector('title').textContent,
    link: item.querySelector('link').textContent,
    description: item.querySelector('description').textContent,
  }));
  return { title: channelTitle, description: channelDescription, items };
};

export { addProxy, getLoadingErrorType, parseRss };
