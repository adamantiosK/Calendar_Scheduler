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
    allowOverlapping: boolean;
  }
  
  
  export interface ListOptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project | null;
  }
  

  
export interface TodoistProjectsProps {
    apiToken: string;
    user_id: string;
  }