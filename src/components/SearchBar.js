import React from "react";
import s from '../../src/scss/components/SearchBar.module.scss';
import { IoSearchOutline } from "react-icons/io5";

class SearchBarComponent extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      stringValue: ''
    }
  }

  onChangeInputSearchBar = (searchStringValue) => {
    if (this.props.type === 'reservation') {
      return this.props.modelData.reduce((collection, data) => {
        const isStringIncluded = Object.keys(data).some((guestKey) => {
          if (data[guestKey] && data[guestKey].toString().indexOf(searchStringValue) > -1) {
            return true;
          }
        });

        if (collection && isStringIncluded) {
          collection.push(data);

          return collection;
        }

        return collection;
      }, []);
    } else {
      // const selectedTag = this.props.selectedTab;
      const result = this.props.result || [];
      // const guest = this.props.guest || [];

      // if (selectedTag === 0) {
      return result.reduce((collection, data) => {
        const isStringIncluded = Object.keys(data).some((guestKey) => {
          if (data[guestKey] && data[guestKey].toString().indexOf(searchStringValue) > -1) {
            return true;
          }
        });

        if (collection && isStringIncluded) {
          collection.push(data);

          return collection;
        }

        return collection;
      }, []);
      // }

      // 部屋割当
      // if (selectedTag === 1) {
      //   return result.reduce((collection, data) => {
      //     const isStringIncluded = Object.keys(data).some((guestKey) => {
      //       if (data[guestKey] && data[guestKey].toString().indexOf(searchStringValue) > -1) {
      //         return true;
      //       }
      //     });

      //     if (collection && isStringIncluded) {
      //       collection.push(data);

      //       return collection;
      //     }

      //     return collection;
      //   }, []);
      // }

      // その他のお客様情報
      // if (selectedTag === 2) {
      //   return guest.reduce((collection, data) => {
      //     const isStringIncluded = Object.keys(data).some((guestKey) => {
      //       if (data[guestKey] && data[guestKey].toString().indexOf(searchStringValue) > -1) {
      //         return true;
      //       }
      //     });

      //     if (collection && isStringIncluded) {
      //       collection.push(data);

      //       return collection;
      //     }

      //     return collection;
      //   }, []);
      // }
    }
  }

  onResetInputSearch = () => {
    const result = this.onChangeInputSearchBar(this.state.stringValue);
    this.props.onChangeInputSearchBar(result);
  }

  clearString = () => {
    this.state.stringValue = '';
  }

  render() {
    const {
      onChangeInputSearchBar,
      isDisappear,
    } = this.props;

    return (
      <div
        className={`${s.searchBar} ${isDisappear === 'true' ? 'dis-n' : ''} `}
      >
        <IoSearchOutline />
        <input
          placeholder="検索文字を入力"
          value={this.state.stringValue}
          onChange={(e) => {
            this.setState({
              stringValue: e.target.value
            })

            const result = this.onChangeInputSearchBar(e.target.value)
            onChangeInputSearchBar(result);
          }}
        />
      </div>
    )
  }
}
export default SearchBarComponent;