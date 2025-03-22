### Hexlet tests and linter status:
[![Actions Status](https://github.com/programmer-kazarin/frontend-project-11/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/programmer-kazarin/frontend-project-11/actions)
[![Maintainability](https://api.codeclimate.com/v1/badges/982483ba03a62ea85671/maintainability)](https://codeclimate.com/github/programmer-kazarin/frontend-project-11/maintainability)

[Ссылка на получившийся сайт](https://v0-new-project-2up9gbfhbls.vercel.app/)

Log:
I. 
1. Create .gitignore file
2. npm init
3. Codeclimate badge
4. npm install -D eslint eslint-config-airbnb-base eslint-plugin-import
5. eslint.config.js from https://github.com/hexlet-boilerplates/webpack-package/blob/main/eslint.config.js
6. Create .eslintignore file
7. npm install -D webpack webpack-cli
8. create index.html, fill from https://frontend-rss-reader-ru.hexlet.app/
9. create src/index.js
10. webpack.config.js from https://github.com/hexlet-boilerplates/webpack-package/blob/main/webpack.config.js
11. Makefile
12. npm install -D html-webpack-plugin
13. npm install -D webpack-dev-server
14. package.json add "type": "module",
15. npm install bootstrap
16. npm install -D css-loader postcss-loader sass sass-loader style-loader
17. Create src/styles.scss with @import "~bootstrap/scss/bootstrap";
18. Deploy to Versel
II.
19. Create 'src/init.js' with default function.
20. npm install on-change
21. Вынесите слой View (тот, где вотчеры) в отдельный файл. 'src/watchers.js'
22. npm install yup
23. После отправки данных формы, производить валидацию и подсвечивать красным рамку вокруг инпута, если адрес невалидный.
24. Валидировать дубли. После того как поток добавлен, форма принимает первоначальный вид.
III.
25. npm install i18next
26. i18next create instance and init
27. Create src/locales/ru.js with translation object.
28. Create src/locales/index.js
29. Create src/locales/locale.js with locale mapping.
30. src/watchers.js - error messages from i18next.
IV.
31. npm install axios
32. Add proxy for URL with hexlet-allorigins: 'src/url_proxy.js'. https://github.com/Hexlet/hexlet-allorigins
33. Create src/utils.js with loadRss and getLoadingErrorType functions.
34. Function loadRss with axios get request.
35. Function parseRss in src/utils.js
36. npm install lodash
37. Add parsed object to feeds and posts in state.
38. Add feeds and posts elements to elements object.
39. Add handleLoadingStatus, handleFeeds, handlePosts to src/watchers.js.