import React from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import "../scss/components/LoaderOverlay.scss"

class LoaderOverlay extends React.Component {
	constructor(props, context) {
    super(props, context);
    this.state = {
      common: this.props.common,
    };
	}
	
	render() {
		const {
      common,
		} = this.state;

		return (
			<>
				{common.loading.isShow ?
					<div className="loaderOverlay_wapper">
						<FontAwesomeIcon icon={faSpinner} spin/>
					</div>
				: ""}
			</>
		);
	}
}

const mapStateToProps = (state, props) => {
  return {
    common: state.common,
  };
};

export default connect(mapStateToProps)(LoaderOverlay);