import { Pipe, PipeTransform } from '@angular/core'
import { NsPlaylist } from '../../../../../../../../library/ws-widget/collection/src/lib/btn-playlist/btn-playlist.model'

@Pipe({
  name: 'filterPlaylist',
})
export class FilterPlaylistPipe implements PipeTransform {
  transform(playlists: NsPlaylist.IPlaylist[], searchPlaylistQuery: string): NsPlaylist.IPlaylist[] | undefined {
    const filteredPlaylists = playlists.filter(
      (playlist: NsPlaylist.IPlaylist) =>
        playlist.name.toLowerCase().includes((searchPlaylistQuery || '').toLowerCase()),
    )

    return filteredPlaylists.length ? filteredPlaylists : undefined
  }
}
