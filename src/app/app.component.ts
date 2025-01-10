import {Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  inputFiles: string[] = [];
  title = 'Cryptone';

  ngOnInit(): void {
    (window as any).electron.receive('files-selected', (inputFiles: string[]) => {
      this.inputFiles = inputFiles;
    });
  }
}
