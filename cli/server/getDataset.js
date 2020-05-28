const getAvailable = require("./getAvailable");
const helpers = require("./getDatasetHelpers");

const setUpGetDatasetHandler = ({datasetsPath}) => {
  return async (req, res) => { // eslint-disable-line consistent-return
    try {
      const availableDatasets = await getAvailable.getAvailableDatasets(datasetsPath);
      const info = helpers.interpretRequest(req, datasetsPath);
      const redirected = helpers.redirectIfDatapathMatchFound(res, info, availableDatasets);
      if (redirected) return;
      helpers.makeFetchAddresses(info, datasetsPath, availableDatasets);
      if (info.isGzipped){
        req.headers['x-no-compression']=true;
      }

      await helpers.sendJson(res, info);
    } catch (err) {
      console.trace(err);
      return helpers.handleError(res, `couldn't fetch JSONs`, err.message);
    }
  };
};


module.exports = {
  setUpGetDatasetHandler
};
