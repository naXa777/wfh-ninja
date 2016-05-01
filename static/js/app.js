function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var Main = React.createClass({
  componentDidMount: function() {
    window.scrollUp = this.scrollUp;
    window.scrollDown = this.scrollDown;
  },

  scrollUp: function(e) {
    if (e) {
      e.preventDefault();
    }
    $('html, body').animate({
      scrollTop: 0,
      scrollLeft: 0
    }, 400);
  },

  scrollDown: function(e) {
    if (e) {
      e.preventDefault();
    }
    $('html, body').animate({
      scrollTop: document.body.scrollHeight,
      scrollLeft: 0
    }, 400);
  },

  render: function() {
    return (
        <div className="site-wrapper">
          <Quotes />
          <SubmitForm />
          <p className="ack">Original <a
              href="http://getbootstrap.com/examples/cover/" target="_blank">Cover</a> template for <a
              href="http://getbootstrap.com" target="_blank">Bootstrap</a> created by <a
              href="https://twitter.com/mdo" target="_blank">@mdo</a>.</p>
          <div className="mastfoot clearfix">
            <div className="inner">
              <nav>
                <ul className="hide nav mastfoot-nav pull-left">
                  <li>
                    <p>Всего: </p>
                  </li>
                </ul>

                <ul className="nav mastfoot-nav pull-right">
                  <li><a href="#">
                    <div onClick={this.scrollDown}>Добавить</div>
                  </a></li>
                  <li><a href="/summary">Топ</a></li>
                </ul>
              </nav>
            </div>
          </div>

        </div>
    );
  }
});

ReactDOM.render(<Main />, document.body);
