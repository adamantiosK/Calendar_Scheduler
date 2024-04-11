export interface Project {
    id: number;
    name: string;
    isSelected: boolean; // Tracks whether the project is selected
    monday_availability: boolean;
    tuesday_availability: boolean;
    wednesday_availability: boolean;
    thursday_availability: boolean;
    friday_availability: boolean;
    saturday_availability: boolean;
    sunday_availability: boolean;
    start_availability: string; // Time in 24-hour format (e.g., "08:00")
    end_availability: string; // Time in 24-hour format (e.g., "17:00")
    allow_overlapping: boolean;
  }
  
  
  export interface ListOptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project | null;
  }
  

  
export interface TodoistProjectsProps {
    api_token: string;
    user_id: string;
    list_id?: number;
    is_selected ?: boolean;
  }


  export interface Reminder {
    id: string;
    due: {
        date: string;
    };
    project_id: string;
    priority: number;
    content: string;
    description: string;
}

export interface UserListData {
    service_id: string;
    start_availability: string;
    end_availability: string;
    monday_availability: boolean;
    tuesday_availability: boolean;
    wednesday_availability: boolean;
    thursday_availability: boolean;
    friday_availability: boolean;
    saturday_availability: boolean;
    sunday_availability: boolean;
}