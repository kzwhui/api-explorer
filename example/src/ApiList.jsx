const { stringify, parse } = require('querystring');
const React = require('react');
const PropTypes = require('prop-types');

const localDirectory = require('../swagger-files/directory.json');

class ApiList extends React.Component {
  constructor(props) {
    super(props);

    const qs = parse(document.location.search.replace('?', ''));

    this.state = {
      apis: localDirectory,
      selected: qs.selected || 'swagger-files/petstore.json',
      customUrl: qs.customUrl,
    };

    this.changeApi = this.changeApi.bind(this);
  }

  componentDidMount() {
    fetch('https://api.apis.guru/v2/list.json')
      .then(res => res.json())
      .then(apis =>
        this.setState(prevState => {
          return {
            apis: { ...prevState.apis, ...apis },
          };
        })
      );

    this.props.fetchSwagger(this.state.selected);
  }

  componentDidUpdate(prevProps, prevState) {
    const { selected } = this.state;

    if (prevState.selected !== selected && selected !== 'enter-a-url') {
      this.props.fetchSwagger(selected);
      window.history.pushState('', '', `?${stringify({ selected })}`);
    }
  }

  changeApi(e) {
    this.setState({ selected: e.currentTarget.value, customUrl: false });
  }

  render() {
    const { apis, selected, customUrl } = this.state;

    return (
      <h3>
        Select an API:&nbsp;
        {selected === 'enter-a-url' ? (
          <form style={{ display: 'inline' }}>
            <input name="selected" type="url" />
            <input name="customUrl" type="hidden" value="true" />
            <button type="submit">Go</button>
          </form>
        ) : (
          <>
            <select onChange={this.changeApi} value={selected}>
              <option value="enter-a-url">Enter a URL</option>
              {selected && customUrl && (
                <option disabled value={selected}>
                  {selected}
                </option>
              )}

              {Object.keys(apis).map(name => {
                const api = apis[name];
                const preferred = api.preferred || Object.keys(api.versions)[0];
                return (
                  <option key={name} value={api.versions[preferred].swaggerUrl}>
                    {name.substring(0, 30)}
                  </option>
                );
              })}
            </select>
            &nbsp;
            <a href={selected}>View document</a>
          </>
        )}
      </h3>
    );
  }
}

ApiList.propTypes = {
  fetchSwagger: PropTypes.func.isRequired,
};

module.exports = ApiList;
