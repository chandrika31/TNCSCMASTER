import { Component, OnInit, ViewChild } from '@angular/core';
import { SelectItem, MessageService } from 'primeng/api';
import { Dropdown } from 'primeng/primeng';
import { AuthService } from 'src/app/services/auth.service';
import { RestAPIService } from 'src/app/services/restAPI.service';
import { TableConstants } from 'src/app/constants/table.constants';
import { PathConstants } from 'src/app/constants/path.constants';
import { StatusMessage } from 'src/app/constants/Messages';
import { HttpErrorResponse } from '@angular/common/http';
import { RoleBasedService } from 'src/app/shared/role-based.service';
import { AstMemoryEfficientTransformer } from '@angular/compiler';

@Component({
  selector: 'app-user-master',
  templateUrl: './user-master.component.html',
  styleUrls: ['./user-master.component.css']
})
export class UserMasterComponent implements OnInit {
  UserMasterData: any;
  UserMasterCols: any;
  UserName: any;
  Password: any;
  Email: any;
  Emp: any;
  Phone: any;
  region:any;
  data:any;
  RoleMappingOptions: SelectItem[];
  RoleMapping: any;
  RoleMappingData: any;
  enableRegion: boolean = false;
  enableGodown: boolean = false;
  RCode: any;
  GCode: any;
  regions: any;
  roleId: any;
  GodownData: any;
  FilteredArray: any;
  GodownCode: any;
  GodownName: any;
  loggedInRCode: any;
  
  Active: any;
  regionOptions: SelectItem[];
  godownOptions: SelectItem[];
  canShowMenu: boolean;
  searchText: any;
  loading: boolean;
  viewPane: boolean = false;
  isViewed: boolean = false;
  isEdited: boolean = false;
  @ViewChild('godown', { static: false }) godownPanel: Dropdown;
  @ViewChild('role', { static: false }) rolePanel: Dropdown;
  @ViewChild('region', { static: false }) regionPanel: Dropdown;
  


  constructor(private authService: AuthService, private roleBasedService: RoleBasedService, private restAPIService: RestAPIService, private messageService: MessageService,
    private tableConstants: TableConstants) { }

  ngOnInit() {
    this.canShowMenu = (this.authService.isLoggedIn()) ? this.authService.isLoggedIn() : false;
    this.loggedInRCode = this.authService.getUserAccessible().rCode;
    this.roleId = JSON.parse(this.authService.getUserAccessible().roleId);
    this.regions = this.roleBasedService.getRegions();
    this.data = this.roleBasedService.getInstance();
  }
 
  onSelect(item, type) {
    let roleSelection = [];
    let regionSelection = [];
    let godownSelection = [];
    switch (item) {
       
      
      case 'RoleMapping':
        if (type === 'enter') {
          this.rolePanel.overlayVisible = true;
        }
        if (this.RoleMappingOptions === undefined) {
          this.restAPIService.get(PathConstants.ROLE_MAPPING).subscribe(res => {
            if (res !== undefined) {
              this.RoleMappingData = res;
              this.RoleMappingData.forEach(data => {
                roleSelection.push({ label: data.MappingName, value: data.MappingId, RoleId: data.RoleId });
              });
              roleSelection.unshift({ label: '-select-', value: null, disabled: true });
              this.RoleMappingOptions = roleSelection;
            }
          });
        }
        if (this.RoleMapping !== undefined) {
          if (this.RoleMapping.RoleId === 1 || this.RoleMapping.RoleId === 8 || this.RoleMapping.RoleId === 9
            || this.RoleMapping.RoleId === 10 || this.RoleMapping.RoleId === 11) {
            this.enableRegion = true;
            this.enableGodown = true;
          } else if (this.RoleMapping.RoleId === 2 || this.RoleMapping.RoleId === 4 || this.RoleMapping.RoleId === 5) {
            this.enableRegion = false;
            this.enableGodown = true;
          } else if (this.RoleMapping.RoleId === 3 || this.RoleMapping.RoleId === 6 || this.RoleMapping.RoleId === 7) {
            this.enableRegion = false;
            this.enableGodown = false;
          }
        }
        break;
        case 'reg':
        this.regions = this.roleBasedService.regionsData;
        if (type === 'enter') {
          this.regionPanel.overlayVisible = true;
        }
        if (this.roleId === 1) {
          if (this.regions !== undefined) {
            regionSelection.push({ label: 'All', value: null });
            this.regions.forEach(x => {
              regionSelection.push({ label: x.RName, value: x.RCode });
            });
            this.regionOptions = regionSelection;
          }
        }
        break;
      case 'gd':
        this.GodownData = this.roleBasedService.godownsList
        if (type === 'enter') {
          this.godownPanel.overlayVisible = true;
        }
         
        if (this.roleId === 1) {
        if (this.data !== undefined) {
          godownSelection.push({ label: 'All', value: null });
          this.data.forEach(x => {
             
              godownSelection.push({ label: x.GName, value: x.GCode });
           });
          this.godownOptions = godownSelection;
        }
        break;
    }
    } 
  }
  onView() {
    this.loading = true;
    this.restAPIService.get(PathConstants.USERMASTER_GET).subscribe(res => {
      if (res !== undefined && res !== null && res.length !== 0) {
        this.UserMasterCols = this.tableConstants.UserMaster;
        this.UserMasterData = res;
        this.FilteredArray = res;
        let sno = 0;
        this.UserMasterData.forEach(s => {
          sno += 1;
          s.SlNo = sno;
        });
        this.loading = false;
      } else {
        this.loading = false;
        this.messageService.clear();
        this.messageService.add({
          key: 't-err', severity: StatusMessage.SEVERITY_WARNING,
          summary: StatusMessage.SUMMARY_WARNING, detail: StatusMessage.NoRecForCombination
        });
      }
    }, (err: HttpErrorResponse) => {
      if (err.status === 0 || err.status === 400) {
        this.loading = false;
        this.messageService.clear();
        this.messageService.add({
          key: 't-err', severity: StatusMessage.SEVERITY_ERROR,
          summary: StatusMessage.SUMMARY_ERROR, detail: StatusMessage.ErrorMessage
        });
      }
    });
  }

  onRow(event, selectedRow) {
    this.isEdited = true;
    this.isViewed = false;
    this.RoleMappingOptions = [{ label: selectedRow.MappingName, value: selectedRow.MappingId }];
    this.RoleMapping = selectedRow.MappingName;
    this.UserName = selectedRow.UserName;
    this.Password = selectedRow.Pwd;
    this.Email = selectedRow.EMailId;
    this.Emp = selectedRow.EmpId;
    this.Phone = selectedRow.PhoneNumber;
    this.RCode = selectedRow.Regioncode;
    this.GCode = selectedRow.GodownCode;
    this.Active = selectedRow.Flag;
  }

  onAdd() {
    this.isEdited = true;
    this.isViewed = false;
    this.RoleMappingOptions = this.RoleMapping = undefined;
    this.Password = this.Email = this.Emp = this.Phone = this.RCode = this.GCode = null;
    this.Active = false;
  }

  onPrev() {
    this.loading = true;
    const params = {
      'UserName': this.UserName,
    };
    this.restAPIService.getByParameters(PathConstants.USER_MASTER_GET, params).subscribe(res => {
      if (res.length === 0) {
        this.isEdited = true;
        this.isViewed = false;
        this.RoleMappingOptions = this.RoleMapping = undefined;
        this.Password = this.Email = this.Emp = this.Phone = this.RCode = this.GCode = null;
        this.Active = false;
        this.loading = false;
      } else {
        this.loading = false;
        this.messageService.clear();
        this.messageService.add({
          key: 't-err', severity: StatusMessage.SEVERITY_WARNING,
          summary: StatusMessage.SUMMARY_WARNING, detail: 'User Name Already Exists!'
        });
      }
    });
  }

  onSave() {
    const params = {
      'UserName': this.UserName,
      'Pwd': this.Password,
      'EMailId': this.Email, 
      'EmpId': this.Emp,
      'PhoneNumber': this.Phone,
      'RoleId': this.RoleMapping.value,
      'Flag': this.Active,
      'GodownCode': this.GCode,
      'Regioncode': this.RCode ,
    };
    this.restAPIService.post(PathConstants.USERMASTER_POST, params).subscribe(res => {
      if (res) {
        this.onView();
        this.isEdited = false;
        this.messageService.clear();
        this.messageService.add({
          key: 't-err', severity: StatusMessage.SEVERITY_SUCCESS,
          summary: StatusMessage.SUMMARY_SUCCESS, detail: StatusMessage.SuccessMessage
        });
      } else {
        this.loading = false;
        this.messageService.clear();
        this.messageService.add({
          key: 't-err', severity: StatusMessage.SEVERITY_ERROR,
          summary: StatusMessage.SUMMARY_ERROR, detail: StatusMessage.ErrorMessage 
        });
      }
    }, (err: HttpErrorResponse) => {
      if (err.status === 0 || err.status === 400) {
        this.loading = false;
        this.messageService.clear();
        this.messageService.add({
          key: 't-err', severity: StatusMessage.SEVERITY_ERROR,
          summary: StatusMessage.SUMMARY_ERROR, detail: StatusMessage.ErrorMessage
        });
      }
    });
  }


  onSearch(value) {
    this.UserMasterData = this.FilteredArray;
    if (value !== undefined && value !== '') {
      value = value.toString().toUpperCase();
      this.UserMasterData = this.FilteredArray.filter(item => {
        return item.UserName.toString().toUpperCase().startsWith(value);
      });
    } else {
      this.UserMasterData = this.FilteredArray;
    }
  }
  onReset(item) {
    if (item === 'user') {
      this.UserMasterData = this.UserMasterCols = undefined;
      // } else if (item === 'role') {
      // this.enableRegion = this.enableGodown = this.GCode = this.RCode = undefined;
    }
  }

  onClear() {
    this.UserName = this.Password = this.Email = this.Emp = this.Phone = this.RCode = this.GCode = null;
    this.UserMasterData = this.UserMasterCols = this.RoleMappingOptions = this.RoleMapping = null;
    this.isEdited = this.Active = false;
  }
}