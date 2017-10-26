import { VillaCompactView } from './Villa/Villa';
import { PhotoSlider } from '../photoslider/Photoslider';
import * as React from 'react';
import './Home.css';
import { ChateauItem, ChateauListViewComponent, ChateauPost } from './Chateau/Chateau';
import { CHATEAU_CONTENT_TYPE_ID, ContentfulClient, SLIDER_PHOTO_CONTENT_TYPE_ID } from '../Contentful';
import { ContentfulClientApi, Entry, EntryCollection } from 'contentful';
import { Photo, SliderPhotoContentModel } from '../photoslider/Types';
interface State {
  introClosed: boolean;
  chateauPosts?: Entry<ChateauPost>[];
  sliderPhotos?: Photo[];
}

export class Home extends React.Component<{}, State> {
  client: ContentfulClientApi = ContentfulClient;
  images: Photo[] = [
    {
      original: 'http://lorempixel.com/1000/600/nature/1/',
      thumbnail: 'http://lorempixel.com/250/150/nature/1/',
    },
    {
      original: 'http://lorempixel.com/1000/600/nature/2/',
      thumbnail: 'http://lorempixel.com/250/150/nature/2/'
    },
    {
      original: 'http://lorempixel.com/1000/600/nature/3/',
      thumbnail: 'http://lorempixel.com/250/150/nature/3/'
    }
  ];
  state = {
    introClosed: false,
    chateauPosts: [],
    sliderPhotos: [],
  }; 
  constructor() {
    super();
    this.initPhotoSliderContentState();
    this.initChateauContentState();
  }

  initPhotoSliderContentState() {
    return this.client.getEntries({content_type: SLIDER_PHOTO_CONTENT_TYPE_ID})
    .then(content => {console.log('got slider photos', content); return content; })
    .then((content: EntryCollection<SliderPhotoContentModel>) => content.items.map(photo => {
          return {
            original: photo.fields.image.fields.file.url,
            thumbnail: photo.fields.image.fields.file.url
          };
        }))
    .then((photos) => {
      this.setState({...this.state, sliderPhotos: photos});
      return photos;
    });
  }
  
  initChateauContentState(): Promise<EntryCollection<ChateauPost>> {
    return this.client.getEntries({content_type: CHATEAU_CONTENT_TYPE_ID})
    .then((content) => {
      this.setState({...this.state, chateauPosts: content.items});
      return content;
    });
  }
  render() {
    return (
      <div className="container">
        <section className="image-intro">
          {this.renderIntroHeader()}
          <PhotoSlider 
            items={this.state.sliderPhotos} 
            closed={this.state.introClosed}   
            onClose={() => this.onIntroClose()} 
          />
        </section>
       <ChateauListViewComponent>
        {this.state.chateauPosts
          .map((item: Entry<ChateauPost>) => <ChateauItem key={item.fields.slug} item={item} />)}
       </ChateauListViewComponent>
       <VillaCompactView>aaaa</VillaCompactView>  
        <section>Villa</section>
        <section>Omgeving</section>
        <button className="button">Meer informatie</button>     
      </div>
    );
  }
  onIntroClose() {
    this.setState({introClosed: true});
  }
  renderIntroHeader() {
    return (
      <header className={this.state.introClosed ? 'hidden' : ''}>
        <span className="close" onClick={() => this.onIntroClose()}>X</span>
        <figure>
          <img src="./logo.png" alt="Logo" />
          <h1><span>Goed in</span> Frankrijk</h1>
        </figure> 
        <hr />
        <ul>
          <li>Kindvriendelijk</li>
          <li>Luxe vakantie-villa's</li>
          <li>Persoonlijk contact</li>
        </ul>
        <p>Zeven eigenaren van luxe vakantie-villa's 
          gelegen in Zuid-Frankrijk hebben zich verenigd in een stichting.  
          Dit om zich te kunnen onderscheiden in mooie en luxe ingerichte villa's met een 
          echt thuisgevoel. Wij zijn er voor uw gemakken en een mooie vakantie.
        </p>   
      </header> 
    );
  }
}