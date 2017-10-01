import React from "react";
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import Select from "react-select";
import { controlsWidth } from "../../util/globals";
import { loadJSONs } from "../../actions/loadData";
import { analyticsControlsEvent } from "../../util/googleAnalytics";
import { RESET_CONTROLS, MAP_ANIMATION_PLAY_PAUSE_BUTTON } from "../../actions/types";

@connect() // to provide dispatch
class ChooseDatasetSelect extends React.Component {
  constructor(props) {
    super(props);
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    selected: PropTypes.string.isRequired,
    choice_tree: PropTypes.array,
    title: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired
  }

  getStyles() {
    return {
      base: {
        width: controlsWidth
      }
    };
  }

  // assembles a new path from the upstream choices and the new selection
  // downstream choices will be set to defaults in parseParams
  createDataPath(dataset) {
    let p = (this.props.choice_tree.length > 0) ? "/" : "";
    p += this.props.choice_tree.join("/") + "/" + dataset;
    return p;
  }

  changeDataset(newPath) {
    // 0 analytics (optional)
    analyticsControlsEvent(`change-virus-to-${newPath.replace(/\//g, "")}`);
    // 1 reset redux controls state in preparation for a change
    this.props.dispatch({type: RESET_CONTROLS});
    if (window.NEXTSTRAIN && window.NEXTSTRAIN.mapAnimationLoop) {
      clearInterval(window.NEXTSTRAIN.mapAnimationLoop);
      window.NEXTSTRAIN.mapAnimationLoop = null;
      this.props.dispatch({
        type: MAP_ANIMATION_PLAY_PAUSE_BUTTON,
        data: "Play"
      });
    }
    // 2 change URL (push, not replace)
    this.context.router.history.push({
      pathname: newPath,
      search: ""
    });
    // 3 load in new data (via the URL we just changed, kinda weird I know)
    this.props.dispatch(loadJSONs(this.context.router));
  }

  getDatasetOptions() {
    let options = {};
    if (this.props.options) {
      options = this.props.options.map((opt) => {
        return {
          value: opt,
          label: opt
        };
      });
    }
    return options;
  }

  render() {
    const styles = this.getStyles();
    const datasetOptions = this.getDatasetOptions();
    return (
      <div style={styles.base}>
        <Select
          name="selectDataset"
          id="selectDataset"
          value={this.props.selected}
          options={datasetOptions}
          clearable={false}
          multi={false}
          onChange={(opt) => {
            this.changeDataset(this.createDataPath(opt.value));
          }}
        />
      </div>
    );
  }
}

export default ChooseDatasetSelect;