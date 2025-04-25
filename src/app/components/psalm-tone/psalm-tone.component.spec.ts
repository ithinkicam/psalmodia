import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PsalmToneComponent } from './psalm-tone.component';

describe('PsalmToneComponent', () => {
  let component: PsalmToneComponent;
  let fixture: ComponentFixture<PsalmToneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PsalmToneComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PsalmToneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
