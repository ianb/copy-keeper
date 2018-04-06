const db = new PouchDB('copy-keeper');
let searchTerm;
let inSidebar = location.href.includes("?sidebar");

class Clip extends React.Component {
  render() {
    // Properties:
    // text, closestId, screenshot.(height/width/url), docTitle, url, time(ms)
    let fullUrl = this.props.url;
    if (this.props.closestId) {
      fullUrl += "#" + this.props.closestId;
    }
    let formattedDate = formatDate(new Date(this.props.time));
    return <div className="clip">
      <div>
        <a href={fullUrl}>{this.props.docTitle}</a> at {formattedDate} <button onClick={this.onCopy.bind(this)}>copy</button>
      </div>
      <div>
        <img className="clipImage" src={this.props.screenshot.url} alt={this.props.text} />
      </div>
    </div>;
  }

  onCopy() {
    let input = document.createElement("input");
    input.type = "text";
    document.body.appendChild(input);
    input.value = this.props.text;
    input.select();
    console.log("tried to copy", this.props.text);
    document.execCommand("copy");
    document.body.removeChild(input);
  }
}

class ClipList extends React.Component {
  render() {
    let lis = [];
    for (let clip of this.props.clips) {
      lis.push(<li key={clip._id}><Clip {...clip} /></li>);
    }
    return <ul className="clips">
      {lis}
    </ul>;
  }
}

class Page extends React.Component {
  render() {
    return <div>
      <div className="controls">
        { this.props.inSidebar ? <button onClick={this.props.openInTab}>Open in tab</button> : null }
      </div>
      <div>
        <input id="search" defaultValue={searchTerm} placeholder="search" onChange={this.updateSearch.bind(this)} ref={searchElement => this.searchElement = searchElement} />
      </div>
      <ClipList clips={this.props.clips} />
    </div>;
  }

  updateSearch() {
    searchTerm = this.searchElement.value;
    if (!this.timeoutId) {
      this.timeoutId = setTimeout(() => {
        render();
        this.timeoutId = null;
      }, 50);
    }
  }
}

function formatDate(d) {
  let now = new Date();
  let options = {hour: "numeric"};
  if (now.getYear() !== d.getYear()) {
    options.year = "numeric";
  }
  if (now.getTime() - d.getTime() < 1000*60*60*24*6) {
    options.weekday = "short";
    if (now.getTime() - d.getTime() < 1000*60*60*24) {
      options.minute = "2-digit";
    }
  } else {
    options.day = "numeric";
    options.month = "short";
  }
  return d.toLocaleString([], options);
}

function openInTab() {
  browser.runtime.sendMessage({type: "openInTab"})
}

function matchesSearchTerm(clip, term) {
  let text = JSON.stringify(clip);
  if (term === term.toLowerCase()) {
    text = text.toLowerCase();
  }
  console.log("search", clip.text, text.includes(term));
  return text.includes(term);
}

async function render() {
  let docs = await db.allDocs({include_docs: true});
  let clips = docs.rows.map(r => r.doc);
  if (searchTerm) {
    clips = clips.filter((c) => matchesSearchTerm(c, searchTerm));
  }
  let page = <Page inSidebar={inSidebar} clips={clips} openInTab={openInTab} />
  ReactDOM.render(page, document.getElementById("container"));
}

setInterval(render, 1000);
