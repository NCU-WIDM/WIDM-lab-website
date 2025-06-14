from models.database import *
from json import dumps, loads


class Project(db.Model, SchemaMixin):
    __tablename__ = 'project'
    id = db.Column(db.String(50), nullable=False, unique=True, primary_key=True)
    name = db.Column(db.String(50), nullable=True)
    description = db.Column(db.TEXT, nullable=True)
    content = db.Column(db.TEXT, nullable=True)
    summary = db.Column(db.TEXT, nullable=True)
    tags = db.Column(db.TEXT, nullable=True)
    link = db.Column(db.String(255), nullable=True)
    types = db.Column(db.Text, nullable=True)
    sequence = db.Column(db.Integer, nullable=True)
    icon_path = db.Column(db.String(255), nullable=True)
    github = db.Column(db.String(255), nullable=True)
    members = db.Column(db.TEXT, nullable=True)
    start_time = db.Column(db.DateTime, nullable=True)
    end_time = db.Column(db.DateTime, nullable=True)

    project_task = db.relationship(
        'ProjectTask', backref='member', lazy='select', cascade="all, delete-orphan"
    )

    def to_dict(self):
        self.tags = loads(self.tags)
        self.members = loads(self.members)
        self.types = loads(self.types)
        # self.sequence = loads(self.sequence)
        icon_existed = True if self.icon_path else False
        self.start_time = datetime.strftime(self.start_time, '%Y-%m') if self.start_time else None
        self.end_time = datetime.strftime(self.end_time, '%Y-%m') if self.end_time else None
        
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'content': self.content,
            'summary': self.summary,
            'tags': self.tags,
            'link': self.link,
            'types': self.types,
            'sequence': self.sequence,
            'github': self.github,
            'members': self.members,
            'start_time': self.start_time,
            'end_time': self.end_time,
            'icon_existed': icon_existed,
            'create_time': self.create_time,
            'update_time': self.update_time,
        }


class ProjectTask(db.Model, SchemaMixin):
    __tablename__ = 'project_task'
    title = db.Column(db.String(255))
    sub_title = db.Column(db.Text)
    members = db.Column(db.Text)
    content = db.Column(db.Text)
    papers = db.Column(db.Text)
    project_id = db.Column(db.String(50), db.ForeignKey('project.id', ondelete="CASCADE"))
    parent_id = db.Column(db.Integer, nullable=True)

    def to_dict(self):
        self.members = loads(self.members)
        self.papers = loads(self.papers)

        return {
            'id': self.id,
            'title': self.title,
            'sub_title': self.sub_title,
            'members': self.members,
            'content': self.content,
            'papers': self.papers,
            'project_id': self.project_id,
            'parent_id': self.parent_id,
            'create_time': self.create_time,
            'update_time': self.update_time,
        }