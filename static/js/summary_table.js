var SummaryMain = React.createClass({
  getInitialState: function() {
    return {
      quoteText: '',
      quotes: [],
      index: -1
    };
  },

  componentDidMount: function() {
    this.loadQuotes();
  },

  loadQuotes: function() {
    $.get("/quote", function(result) {
      this.setState({
        quotes: result
      });
      let renderedRows = [];
      let total = _.values(result).length;
      let sortedPositiveResults = _(result)
        .values()
        .filter(row => row['score'] > 1)
        .sortBy(row => -row['score'])
        .slice(0, 15)
        .value();
      sortedPositiveResults.forEach(function(quote) {
        let quoteRow = (

            <tr>
              <td><a href={"/?quoteId=" + quote.id}> {quote.text}</a></td>
              <td data-value={parseInt(quote.score)}>{parseInt(quote.score)}</td>
            </tr>

        );
        renderedRows.push(quoteRow);
      });
      this.setState({total: total});
      this.setState({renderedRows: renderedRows});
      Sortable.init();
    }.bind(this));
  },

  render: function() {
    return (
        <div className="site-wrapper">
          <div className="site-wrapper-inner">
            <div className="cover-container">
              <div className="masthead clearfix">
                <div className="inner">
                  <a href="/">
                    <h3 className="masthead-brand">Выходной бы!</h3>
                  </a>
                </div>
              </div>

              <div className="inner cover">
                <h1>Лучшие отмазки</h1>

                <form>
                  <div className="table-responsive">
                    <table className="table table-bordered" data-sortable>
                      <thead>
                      <tr className="table-header">
                        <th>Отмазка</th>
                        <th>Рейтинг</th>
                      </tr>
                      </thead>
                      <tbody>
                      {this.state.renderedRows}
                      </tbody>
                    </table>
                  </div>

                  <div className="admin-buttons">
                    Хочешь помочь сайту? <a href="/">Голосуй</a> за хорошие отмазки!
                  </div>

                </form>

                <div className="mastfoot clearfix">
                  <div className="inner">
                    <nav>
                      <ul className="nav mastfoot-nav pull-left">
                        <li>
                          <p>Всего: {this.state.total}</p>
                        </li>
                      </ul>

                      <ul className="nav mastfoot-nav pull-right">
                        <li><a href="/">На главную</a></li>
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

    );
  }
});

ReactDOM.render(<SummaryMain />, document.body);
